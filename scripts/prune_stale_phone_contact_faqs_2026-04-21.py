#!/usr/bin/env python3
"""
Prune stale phone/contact FAQ rows that don't include the three-number save explanation.
Also prunes stale Spanish contact/phone rows that may have returned English answers.
Run BEFORE re-ingesting the new contact/Spanish CSVs.
"""

import os
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ── 1. Delete FAQ rows related to phone/contact that lack the three-number explanation ──
# These were cached from prior sessions and will keep overriding the correct answer.
contact_faq_patterns = [
    "402-440-5438",
    "402-588-1125",
    "julie@mejorvidainsurance",
    "Julie@mejorvidainsurance",
    "julie.*phone",
    "phone.*julie",
    "contact.*julie",
    "reach.*julie",
    "número.*julie",
    "teléfono.*julie",
    "contactar.*julie",
    "comunicar.*julie",
]

# Delete FAQ rows where the answer mentions a phone number but NOT all three numbers
# Strategy: delete any FAQ rows where the answer contains phone references
# (they'll be re-cached correctly from the new knowledge chunks)
print("Deleting stale phone/contact FAQ rows...")

# Fetch all faqs that mention phone numbers
result = supabase.table("faqs").select("id, question, answer").execute()
faqs = result.data

deleted_ids = []
three_number_marker = "402-588-1125"  # presence of this means it has the new explanation

for faq in faqs:
    answer = (faq.get("answer") or "").lower()
    question = (faq.get("question") or "").lower()

    # Check if this FAQ is about contact/phone
    is_contact_faq = any(kw in question or kw in answer for kw in [
        "phone", "teléfono", "telefono", "número", "numero", "contact", "contacto",
        "reach", "comunicar", "llamar", "call", "whatsapp", "text",
        "julie", "how do i get", "cómo", "quien es", "quién es",
        "located", "address", "dirección", "ubicad",
        "approved", "approval", "aprobación", "how long", "cuánto tiempo",
        "same day", "mismo día", "get approved", "instant"
    ])

    if is_contact_faq and "402" in answer:
        # Has a phone number but needs to be refreshed
        # Only delete if it doesn't already have the full three-number explanation
        if three_number_marker not in answer:
            deleted_ids.append(faq["id"])
            print(f"  Deleting FAQ id={faq['id']}: {faq['question'][:80]}")

if deleted_ids:
    # Delete in batches of 50
    for i in range(0, len(deleted_ids), 50):
        batch = deleted_ids[i:i+50]
        supabase.table("faqs").delete().in_("id", batch).execute()
    print(f"\n✅ Deleted {len(deleted_ids)} stale contact/phone FAQ rows.")
else:
    print("No stale contact FAQ rows found to delete.")

# ── 2. Delete stale Spanish FAQ rows that have English answers ──
print("\nChecking for Spanish FAQ rows with English answers...")

spanish_with_english = []
for faq in faqs:
    if faq["id"] in deleted_ids:
        continue  # already deleted

    question = faq.get("question") or ""
    answer = faq.get("answer") or ""

    # Detect Spanish question markers
    is_spanish_question = any(kw in question.lower() for kw in [
        "¿", "cuál", "cual", "cómo", "como", "qué", "que ", "cuánto", "cuando",
        "dónde", "donde", "quién", "quien", "puedo", "tengo", "hay un", "periodo",
        "período", "espera", "familia", "fallezco", "fallecimiento", "póliza", "poliza",
        "cobertura", "aseguradora", "cuánto cuesta", "cuanto cuesta", "cotización"
    ])

    # Detect English answer (no Spanish markers)
    has_spanish_answer = any(kw in answer.lower() for kw in [
        "para ", "con ", "una ", "los ", "las ", "que ", "del ", "puede",
        "también", "tambien", "también", "aseguradora", "póliza", "cobertura",
        "gastos", "familia", "fallecimiento", "días", "meses"
    ])

    if is_spanish_question and not has_spanish_answer and len(answer) > 50:
        spanish_with_english.append(faq["id"])
        print(f"  Deleting Spanish FAQ with English answer id={faq['id']}: {question[:80]}")

if spanish_with_english:
    for i in range(0, len(spanish_with_english), 50):
        batch = spanish_with_english[i:i+50]
        supabase.table("faqs").delete().in_("id", batch).execute()
    print(f"\n✅ Deleted {len(spanish_with_english)} Spanish FAQs with English answers.")
else:
    print("No Spanish FAQs with English answers found.")

# ── 3. Delete knowledge_chunks from old sources that may conflict ──
print("\nChecking knowledge_chunks for stale contact rows without three-number explanation...")

chunks_result = supabase.table("knowledge_chunks").select("id, content, metadata").execute()
chunks = chunks_result.data

stale_chunk_ids = []
for chunk in chunks:
    content = chunk.get("content") or ""
    metadata = chunk.get("metadata") or {}
    source = (
        metadata.get("source_name")
        or metadata.get("source")
        or metadata.get("source_id")
        or ""
    )

    # Target chunks that mention a single phone number for contact purposes
    # but don't have the three-number explanation
    if ("402-440-5438" in content or "402-588-1125" in content) and "Julie" in content:
        if three_number_marker not in content:
            # Only delete from old sources (not our new ones)
            if source not in [
                "rag_contact_fixes_2026_04_20",
                "rag_three_numbers_2026_04_21",
                "rag_qa_fixes_2026_04_20",
                "rag_coverage_gaps_2026_04_20"
            ]:
                stale_chunk_ids.append(chunk["id"])
                print(f"  Marking chunk id={chunk['id']} source={source}: {content[:80]}")

if stale_chunk_ids:
    for i in range(0, len(stale_chunk_ids), 50):
        batch = stale_chunk_ids[i:i+50]
        supabase.table("knowledge_chunks").delete().in_("id", batch).execute()
    print(f"\n✅ Deleted {len(stale_chunk_ids)} stale knowledge chunks.")
else:
    print("No stale knowledge chunks found.")

print("\n✅ Prune complete. Ready to ingest new CSVs.")
