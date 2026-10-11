/**
 * Practice questions for the CDI 2025 Life Insurance Policies Four-Hour Course.
 * Original items written from the public course outline, the CDI FAQ, and the
 * Life-Only Agent examination objectives. Not an official CDI exam form.
 */
(function () {
  "use strict";

  function q(id, topic, prompt, choices, answer, explain) {
    return { id: id, topic: topic, q: prompt, choices: choices, answer: answer, explain: explain };
  }

  window.MVI_CA_LIFE_EXAM = [
    q("tr-01", "Training requirement", "Which life agents must complete the 2025 Life Insurance Policies four-hour course before selling nonterm life insurance?", [
      "Every California life agent, no matter when the license was issued",
      "Only agents who sell term life with no cash value",
      "Life agents licensed on or after January 1, 2024, who sell individual life policies other than term life with no cash value",
      "Only agents who also sell annuities"
    ], 2, "Insurance Code section 1749.81(a) applies to a life agent licensed on or after January 1, 2024, who sells individual life policies other than term life with no cash value. The Department’s FAQ says an agent licensed before that date is not required to take this course."),

    q("tr-02", "Training requirement", "When must that four-hour training be finished?", [
      "Before the first license renewal after 2025",
      "Before soliciting individual consumers to sell those nonterm life policies",
      "Within 30 days after the first sale",
      "Only if the Department sends a deficiency notice"
    ], 1, "Section 1749.81(a) requires the training before the agent solicits individual consumers for those policies. The course outline says the requirement became operative on January 1, 2025."),

    q("tr-03", "Training requirement", "The Department’s FAQ says the four-hour course is required how often?", [
      "Before every license renewal",
      "Once, before soliciting those nonterm policies",
      "Every two years, like annuity training",
      "Each year the agent sells a cash-value policy"
    ], 1, "CDI’s FAQ says this is a one-time requirement for agents licensed on or after January 1, 2024. It is not repeated before each renewal."),

    q("tr-04", "Training requirement", "Who does the four-hour requirement apply to?", [
      "California resident life agents only",
      "Nonresident agents only",
      "Both resident and nonresident California life licensees who meet the licensing-date and product test",
      "Only agents appointed with a California domestic insurer"
    ], 2, "The course outline and the CDI notice say the training applies to all California life licensees, resident and nonresident."),

    q("tr-05", "Training requirement", "For a California resident, how does this four-hour course count toward continuing education?", [
      "It is extra and does not count toward the 24-hour CE requirement",
      "It replaces the one-hour anti-fraud course",
      "It is part of, and not in addition to, the resident licensee’s continuing-education requirement",
      "It satisfies the eight-hour annuity training"
    ], 2, "CDI’s notice says the requirement is part of, and not in addition to, the resident licensee’s continuing-education requirement. It does not replace the separate one-hour Agents and Brokers Anti-Fraud Training."),

    q("tr-06", "Training requirement", "Which topic is not part of the four-hour life-policy training?", [
      "Individual life policies other than term life with no cash value",
      "California law and requirements",
      "Prohibited sales practices and unfair trade practices",
      "The one-hour Agents and Brokers Anti-Fraud Training"
    ], 3, "The outline says the training required by section 1749.81(a) does not include the Department’s one-hour anti-fraud course. That hour must be met separately."),

    q("tr-07", "Training requirement", "What content is barred from an approved four-hour course?", [
      "Explanations of cash value and nonforfeiture options",
      "Material primarily intended to promote the sale or marketing of life policies, or to push a political or legislative view",
      "Insurance Code citations",
      "Comparisons of whole life and universal life features"
    ], 1, "Section 1749.81 says subject matter primarily intended to promote the sale or marketing of life policies does not qualify. The outline also bars philosophy, political views, public-policy positions, and predictions about legislation."),

    q("tr-08", "Training requirement", "Completion of an approved course means which of the following?", [
      "The Insurance Commissioner endorses the course provider and the resulting designation",
      "The agent may sell in every state",
      "The Commissioner does not endorse the course or any designation that comes from completing it",
      "The agent no longer needs a life settlement broker license"
    ], 2, "The outline’s disclaimer says no approved prelicensing or continuing-education course, and no designation from it, should be construed as endorsed by the Commissioner."),

    q("tr-09", "Training requirement", "Fairbanks v. Superior Court describes life insurance as which of the following?", [
      "A security regulated only by FINRA",
      "A contract of indemnity: premiums in exchange for the insurer’s promise to pay a sum to the beneficiary when the named insured dies",
      "A bank deposit with a death benefit",
      "A promise to pay the insured’s medical bills"
    ], 1, "The outline quotes Fairbanks v. Superior Court (2009) 46 Cal.4th 56, 61, for that definition."),

    q("tr-10", "Training requirement", "Senate Bill 263 added which Insurance Code section?", [
      "Section 790",
      "Section 10127.10",
      "Section 1749.81",
      "Section 10509"
    ], 2, "The outline says Senate Bill 263 (Dodd, Chapter 2, Statutes of 2024) added Insurance Code section 1749.81."),

    q("wl-01", "Whole life", "Individual whole life is also called which of the following?", [
      "Straight life, ordinary life, and traditional permanent insurance",
      "Decreasing term",
      "A modified endowment contract in every case",
      "Group credit life"
    ], 0, "The outline uses those three names for individual whole life, also called traditional permanent insurance."),

    q("wl-02", "Whole life", "Why can a whole life premium stay level while the cost of protection rises with age?", [
      "The death benefit decreases each year",
      "Premiums at younger ages are higher than the current cost of protection and build a reserve, or cash value, that helps pay for the policy later",
      "The insurer may cancel the policy at each anniversary",
      "Cash value is invested only in the insured’s checking account"
    ], 1, "The outline says the extra premium at younger ages builds a reserve (cash value) that helps pay for the policy in later years, stretching the cost over a longer period."),

    q("wl-03", "Whole life", "A whole life policy matures when which of the following happens?", [
      "The insured reaches age 65",
      "The free-look period ends",
      "The face amount equals the cash value",
      "The first dividend is paid"
    ], 2, "The outline says the policy matures when the face amount equals the cash value."),

    q("wl-04", "Whole life", "Limited-pay life insurance means which of the following?", [
      "Coverage lasts only as long as premiums are paid",
      "A shorter premium-paying period, with the insurance period continuing in the usual way",
      "A policy that pays only funeral costs",
      "Term insurance with no cash value"
    ], 1, "The outline defines limited-pay life as a shorter premium payment period but a regular insurance period."),

    q("wl-05", "Whole life", "Single-pay life insurance is which of the following?", [
      "Premiums paid once a year",
      "A policy paid for with one premium",
      "A policy that skips premiums whenever the owner chooses, with no effect on cash value",
      "A term policy that becomes paid up after 30 years"
    ], 1, "Single-pay life is paid with one premium. It is not the same as an annual mode, and it is not universal life’s flexible premium."),

    q("wl-06", "Whole life", "Under some whole life policies premiums are paid for a set number of years. Under others they are paid how?", [
      "Only during the contestability period",
      "Throughout the policyholder’s lifetime",
      "Only by the beneficiary",
      "Only if the insured becomes disabled"
    ], 1, "The outline says some policies require premiums for a set number of years, and others require premiums throughout the policyholder’s lifetime."),

    q("vl-01", "Variable life", "Individual variable life varies in amount or duration according to which of the following?", [
      "The insurer’s general-account guaranteed interest rate only",
      "The investment experience of a separate account",
      "The Consumer Price Index, with a guaranteed floor equal to the face amount at all times",
      "The funeral-home price list"
    ], 1, "The outline, citing Insurance Code section 10506 and Bulletin 87-3, says variable life varies with the investment experience of a separate account."),

    q("vl-02", "Variable life", "Compared with traditional whole life, variable life does which of the following?", [
      "Removes the investment risk from the insurer’s separate-account performance",
      "Lets the death benefit or cash value move with separate-account investment results, so values are not guaranteed the way traditional whole life cash values are",
      "Forbids a cash-surrender value",
      "Must be sold without a securities registration"
    ], 1, "The Life-Only objectives describe variable life as derived from whole life but without those guarantees. Values follow the separate account. Agents who sell securities products need the proper securities registration."),

    q("vl-03", "Variable life", "Bulletin 87-3 is the Department bulletin the course outline uses for which product rules?", [
      "Funeral insurance face amounts",
      "Variable life, including grace period, policy loans, and a permitted suicide exclusion",
      "The 10-day free look for buyers under 60",
      "Rebating penalties"
    ], 1, "The outline cites Bulletin 87-3, as amended November 1, 1992, for the variable-life definition and for grace-period, loan, and suicide provisions."),

    q("ul-01", "Universal life", "Non-variable universal life is often described as which of the following?", [
      "Flexible premium adjustable life, including fixed and indexed policies",
      "A policy with no cash value",
      "Decreasing term",
      "A group master contract"
    ], 0, "The outline describes individual non-variable universal life as flexible premium adjustable life, and it includes fixed and indexed policies."),

    q("ul-02", "Universal life", "How does universal life accumulate cash value?", [
      "Premiums and interest are credited to a fund, and expenses and the cost of insurance are deducted",
      "The owner deposits cash value in a separate bank the insurer does not control",
      "Cash value equals the face amount from the first day",
      "Dividends are required by law"
    ], 0, "The outline says cash values are accumulated by crediting premium payments and interest, then deducting expenses and the cost of insurance."),

    q("ul-03", "Universal life", "What can the owner change more easily on universal life than on other policies?", [
      "The insured’s age",
      "Premium payments, including skipping a payment, and the death benefit",
      "The incontestability period",
      "The statutory grace period"
    ], 1, "The outline says universal life lets the owner change or skip premium payments or change the death benefit more easily than any other policy. Those changes can affect the cash value."),

    q("ul-04", "Universal life", "The outline says interest rates on this non-variable universal life are linked to which of the following?", [
      "The Dow Jones Industrial Average only",
      "An external index such as Treasury bills",
      "The insured’s credit score",
      "A guaranteed rate that can never change"
    ], 1, "The outline says interest rates are linked to an external index such as Treasury bills, so the cash value is interest-rate sensitive."),

    q("ul-05", "Universal life", "Why are predictions of future universal-life costs uncertain?", [
      "Because the policy has no cost of insurance",
      "Because future costs depend heavily on how accurate the interest-rate projections are",
      "Because California bans illustrations",
      "Because the death benefit is always the cash value"
    ], 1, "The outline says that because the cash value is interest-rate sensitive, predictions of future costs depend on the accuracy of interest-rate projections."),

    q("ul-06", "Universal life", "A no-lapse guarantee on universal life is which of the following?", [
      "Required on every universal life policy",
      "An option that may be available",
      "The same thing as a modified endowment contract",
      "A waiver of the suicide provision"
    ], 1, "The outline says no-lapse guarantees may be an option. They are not automatic on every contract."),

    q("ul-07", "Universal life", "An increase in expenses or the cost of insurance on a universal life policy can do which of the following?", [
      "Nothing, because both charges are frozen at issue",
      "Reduce the cash value and the death benefit",
      "Force the policy to become term insurance with a cash surrender value",
      "Extend the free-look period"
    ], 1, "The outline says increases in expenses and the cost of insurance can reduce the cash value and the death benefit."),

    q("vul-01", "Variable universal life", "Variable universal life combines which features?", [
      "Term insurance with no cash value and a return-of-premium rider only",
      "Universal life’s flexible premium and adjustable benefits, with values that depend on a separate account",
      "A fixed interest rate in the general account and no investment risk",
      "An endowment that must mature in five years"
    ], 1, "The outline defines it as variable life with universal-life characteristics: flexible premium adjustable life that accumulates cash value and depends on separate-account performance."),

    q("vul-02", "Variable universal life", "A client who cannot stand a drop in cash value is a poor fit for variable universal life because:", [
      "The separate account can lose value",
      "The policy cannot build cash value",
      "California forbids a death benefit on variable policies",
      "Premiums can never be flexible"
    ], 0, "Variable universal life depends on separate-account performance. A client who needs guaranteed cash value is not a match for that risk."),

    q("tm-01", "Term with cash value", "Individual term life generally does which of the following?", [
      "Builds a large guaranteed cash value from the first year",
      "Does not include a cash value",
      "Matures when the face amount equals the cash value",
      "Is always a modified endowment contract"
    ], 1, "The outline says individual term generally does not include a cash value, then lists the exceptions."),

    q("tm-02", "Term with cash value", "The most common term policy that provides guaranteed cash surrender values is which of the following?", [
      "Annual renewable term with no return of premium",
      "Individual term life with return of premium",
      "Credit life",
      "A burial policy over $20,000"
    ], 1, "The outline says the most common term policy with guaranteed cash surrender values is individual term with return of premium."),

    q("tm-03", "Term with cash value", "Which term designs may have cash value even though term usually does not?", [
      "Limited-pay term, term with a level premium period of 30 years or more, and term issued at higher ages such as 70 or older",
      "Only group term",
      "Only term sold to people under 30",
      "Only term that lasts one year"
    ], 0, "The outline lists limited-pay term, long level-premium periods of 30 years or more, and higher issue ages (70 or older, or younger for longer terms)."),

    q("en-01", "Endowment", "If the insured dies before an endowment’s maturity date, the policy pays which of the following?", [
      "Nothing",
      "A death benefit to the beneficiaries",
      "Only the premiums paid, in every case",
      "A lifetime income to the insurer"
    ], 1, "The outline says an endowment pays a death benefit if the policyholder dies before the end of the period."),

    q("en-02", "Endowment", "If the policyholder is living at the end of an endowment period, the policy pays which of the following?", [
      "Nothing, because endowments pay only at death",
      "The face value to the policyholder, in a lump sum or in installments",
      "A refund of premiums only",
      "The cash value to the state"
    ], 1, "The outline says that if the policyholder is living at the end of the period, the policy pays the face value, either in a lump sum or in installments."),

    q("en-03", "Endowment", "An endowment period can be set as which of the following?", [
      "A number of years, such as 5 or 30, or an age the policyholder must reach",
      "Only the insured’s life expectancy calculated after death",
      "Only one year",
      "Only until the first premium is paid"
    ], 0, "The outline says the policy may have a set maturity date, such as 5 or 30 years, or it may end when the policyholder reaches a certain age."),

    q("mec-01", "Modified endowment contract", "A modified endowment contract is which of the following?", [
      "Any term policy",
      "A cash-value life policy that has been overfunded under IRS guidelines",
      "A policy that lost its death benefit",
      "A life settlement"
    ], 1, "The outline defines a modified endowment contract as a cash-value policy that has been overfunded under IRS guidelines."),

    q("mec-02", "Modified endowment contract", "What is the tax result of becoming a modified endowment contract?", [
      "The policy loses its death benefit",
      "An irreversible loss of certain tax benefits",
      "Premiums become tax deductible",
      "The policy must be surrendered within 60 days"
    ], 1, "The outline says the overfunding triggers an irreversible loss of certain tax benefits. The status is not reversed by later paying less."),

    q("mec-03", "Modified endowment contract", "The seven-pay test and the tax definition of a life insurance contract are associated with which Internal Revenue Code treatment?", [
      "Section 1035 only",
      "Section 7702, which the course outline cites for the modified-endowment definition, and the seven-pay overfunding test",
      "A full deduction of personal premiums",
      "Tax-free loans with no limit on a modified endowment contract"
    ], 1, "The course outline and the Life-Only objectives point to IRC section 7702 for the modified-endowment definition. Overfunding is measured by the seven-pay test. A policy that fails is a modified endowment contract."),

    q("mec-04", "Modified endowment contract", "Loans and withdrawals from a modified endowment contract are taxed how?", [
      "As a return of basis first, with no penalty",
      "Earnings are taxed first, and a 10 percent penalty can apply if the taxpayer is under 59 1/2",
      "They are always tax-free",
      "They are taxed only to the beneficiary"
    ], 1, "A modified endowment contract loses the favorable loan treatment of life insurance. Distributions, including loans, come out as taxable income first. A 10 percent additional tax can apply before age 59 1/2."),

    q("fn-01", "Funeral insurance", "California funeral insurance, also called burial insurance, is which of the following?", [
      "A property policy on the cemetery",
      "A life policy that pays a benefit for the funeral or burial expense of a person who is living when the policy is issued",
      "Health insurance for the funeral director",
      "A policy that can be issued only after death"
    ], 1, "The outline says funeral insurance pays a benefit to cover the funeral or burial of the person insured, who is living when the policy is issued."),

    q("fn-02", "Funeral insurance", "The outline’s dollar cap for this funeral insurance, from Insurance Code section 1749.01, is which amount?", [
      "$2,000",
      "$10,000",
      "$20,000",
      "$50,000"
    ], 2, "The outline says the benefit is for funeral or burial expense up to $20,000, as stated in section 1749.01."),

    q("fn-03", "Funeral insurance", "Particular requirements for funeral insurance policies are in which statutes?", [
      "Insurance Code sections 10240 through 10252",
      "Insurance Code sections 790 through 790.15 only",
      "Title 18 of the United States Code",
      "Insurance Code section 1633 only"
    ], 0, "The outline says particular requirements are in Insurance Code sections 10240 through 10252."),

    q("db-01", "Disability benefits", "A waiver of premium or waiver of monthly deduction benefit is triggered when the insured is:", [
      "Unemployed for any reason, with no disability",
      "Totally disabled, under a definition not less favorable than Insurance Code section 10271.1(a)",
      "Merely late on one premium",
      "Traveling outside California"
    ], 1, "Section 10271.1(a)(1) provides a waiver of premium or monthly deduction if the insured becomes totally disabled. The definition may not be less favorable than section 10271.1(a)(2)."),

    q("db-02", "Disability benefits", "Presumptive total disability for that waiver benefit is addressed in which part of section 10271.1?", [
      "Subdivision (a)(3)",
      "The replacement article",
      "Section 1633",
      "The free-look statute for seniors"
    ], 0, "The outline points to section 10271.1(a)(3) for presumptive total disability, and to subdivisions (a)(4), (a)(5), and (a)(6) as well."),

    q("db-03", "Disability benefits", "A waiver of surrender charge under section 10271.1(b) can be triggered by which of the following?", [
      "A request to change the beneficiary",
      "Terminal illness, specified care services, a fatal-if-untreated condition, total disability, chronic illness, or involuntary or voluntary unemployment",
      "Payment of the first premium",
      "Naming a contingent beneficiary"
    ], 1, "The outline lists those section 10271.1(b) triggers: terminal illness, home or community-based services or facility care, a fatal-if-untreated condition, total disability, chronic illness, and involuntary or voluntary unemployment."),

    q("db-04", "Disability benefits", "An accelerated death benefit pays which of the following?", [
      "An extra amount on top of the death benefit if death is accidental",
      "An advance of part of the death proceeds after a qualifying event",
      "The cash surrender value only, and only after lapse",
      "A dividend"
    ], 1, "The outline says an accelerated death benefit is an advance payment of any part of the death proceeds when a qualifying event occurs."),

    q("db-05", "Disability benefits", "A chronic-illness accelerated death benefit under section 10295 requires which of the following?", [
      "That the insured already be receiving long-term care services",
      "No requirement that the insured be receiving long-term care services",
      "A hospital confinement of at least 90 days in every case",
      "That the policy be term insurance with no cash value"
    ], 1, "The outline says chronic illness under section 10295(b)(2)(B) has no requirement that the insured is receiving long-term care services."),

    q("db-06", "Disability benefits", "If an accelerated benefit requires long-term care services or nursing-home confinement under section 10231.2 and following, it is treated as:", [
      "An ordinary death benefit with no extra training",
      "A long-term care benefit, so long-term care training is required before the agent solicits it",
      "A life settlement",
      "Exempt from the Insurance Code"
    ], 1, "The outline says that if the benefit requires long-term care services or nursing-home confinement, it is a long-term care benefit, and long-term care training is required."),

    q("db-07", "Disability benefits", "The long-term care training pattern in the outline is which of the following?", [
      "Four hours once",
      "Eight hours before soliciting, eight hours in each of the first four years, then eight hours every two-year license term beginning with the fifth year",
      "One hour of anti-fraud training only",
      "No training if the agent already has a life license"
    ], 1, "The outline lists eight hours before soliciting, eight hours in each of the first four licensing years, and eight hours each two-year term beginning with the fifth year."),

    q("db-08", "Disability benefits", "Terminal illness in section 10271.1(d) is governed by which body of law, according to the outline?", [
      "The securities laws only",
      "The general disability statutes",
      "The probate code only",
      "Bulletin 87-3 only"
    ], 1, "The outline says terminal illness is defined in section 10271.1(d) but governed by the general disability statutes."),

    q("db-09", "Disability benefits", "Accidental death or dismemberment, accidental loss of sight, and a disability income benefit are:", [
      "Prohibited in individual life policies",
      "Other disability benefits that can be in a life policy",
      "The same thing as a life settlement",
      "Required in every term policy"
    ], 1, "The outline lists accidental death, dismemberment, or loss of sight, and disability income, as disability benefits with other triggers."),

    q("pm-01", "Premium modes", "Which list matches the premium modes the outline says you must know?", [
      "Single premium, limited pay, modified premium, level, fixed versus flexible, and initial premium versus guaranteed maximum premium",
      "Only monthly bank draft",
      "Only single premium and interest only",
      "Per capita and per stirpes"
    ], 0, "Those are the modes listed in the training goals: single, limited pay, modified, level, fixed versus flexible, and initial versus guaranteed maximum."),

    q("pm-02", "Premium modes", "A modified premium pattern usually means which of the following?", [
      "A lower premium in the early years and a higher premium later",
      "One premium that pays the policy for life",
      "A premium that the owner may skip with no consequence",
      "A premium that is always the guaranteed maximum from day one"
    ], 0, "Modified premium starts lower and steps up later. It is different from limited pay and from a single premium."),

    q("pm-03", "Premium modes", "Fixed versus flexible premium distinguishes which products most clearly?", [
      "Traditional whole life, which is fixed, from universal life, which is flexible",
      "Term insurance from a delivery receipt",
      "A primary beneficiary from a contingent beneficiary",
      "Rebating from twisting"
    ], 0, "Whole life is built around a fixed, usually level premium. Universal life is the flexible-premium policy. The outline also separates the initial premium from the guaranteed maximum premium."),

    q("sp-01", "Special purpose policies", "A family policy or family rider is used for which purpose?", [
      "To cover a family on one plan, often with term insurance on the spouse or children",
      "To replace a life settlement",
      "To avoid naming any beneficiary",
      "To guarantee a variable separate-account return"
    ], 0, "Family protection, a family policy, and a family rider insure family members, commonly with term coverage on the spouse and children alongside a base policy."),

    q("sp-02", "Special purpose policies", "A jumping juvenile policy does which of the following?", [
      "Cancels at age 18",
      "Increases the death benefit at a stated age, often without new evidence of insurability",
      "Pays only if the child is the beneficiary",
      "Is illegal in California"
    ], 1, "A jumping juvenile increases the face amount at a specified age, typically with no new evidence of insurability. A payor rider waives premiums if the person paying them dies or becomes disabled."),

    q("sp-03", "Special purpose policies", "Joint life and survivorship life differ how?", [
      "Joint life pays at the first death. Survivorship, or second-to-die, pays at the second death",
      "They are the same contract",
      "Survivorship pays at the first death and joint life never pays",
      "Neither can have a cash value"
    ], 0, "Joint life (first-to-die) pays when the first insured dies. Survivorship pays when the second insured dies and is often used when the need, such as estate liquidity, arises at the second death."),

    q("fl-01", "Free look", "For an individual life policy buyer under 60, Insurance Code section 10127.9 requires a return period of:", [
      "Not less than 10 days and not more than 30 days after the owner receives the policy",
      "Exactly 3 days",
      "Not less than 60 days",
      "One year"
    ], 0, "Section 10127.9 says the insurer’s stated return period shall be not less than 10 days nor more than 30 days after the owner receives the policy."),

    q("fl-02", "Free look", "For a buyer who is 60 or older on the date of purchase, section 10127.10 requires a return period of:", [
      "Not less than 10 days",
      "Not less than 30 days",
      "Not less than 60 days",
      "The same period as the grace period"
    ], 1, "Section 10127.10 defines a senior for this purpose as a person who is 60 or older on the date of purchase, and the return period shall be not less than 30 days."),

    q("fl-03", "Free look", "If an owner returns a non-variable life policy during the cancellation period, the parties are placed as if no policy had been issued. The insurer must refund premiums and any policy fee within how many days after it is notified?", [
      "10 days",
      "30 days",
      "60 days",
      "6 months"
    ], 1, "Section 10127.9 says the premium and policy fee on a non-variable policy are refunded within 30 days from the date the insurer is notified of the cancellation."),

    q("fl-04", "Free look", "If an owner returns an individual variable life policy during the free-look period, the refund is:", [
      "All premiums, even if the separate account has fallen",
      "The account value plus any policy fee",
      "Nothing",
      "The face amount"
    ], 1, "Section 10127.9 says return of a variable life policy during the cancellation period entitles the owner to a refund of the account value and any policy fee, within 30 days after the insurer is notified."),

    q("fl-05", "Free look", "During the 30-day cancellation period on a variable policy issued to a senior, premiums may be invested only in fixed-income investments and money-market funds unless:", [
      "The agent prefers a stock fund",
      "The owner specifically directs investment in the underlying funds",
      "The insurer’s separate account lost money the prior year",
      "The policy is a term policy"
    ], 1, "Section 10127.10 limits investment during that 30-day period to fixed-income investments and money-market funds unless the owner specifically directs otherwise."),

    q("fl-06", "Free look", "On a replacement, the replacing insurer must provide a right to an unconditional refund of all premiums for how long after delivery?", [
      "10 days",
      "30 days",
      "60 days",
      "There is no special replacement refund period"
    ], 1, "Section 10509.6 requires the replacing insurer to provide, in the policy or in a notice delivered with it, an unconditional refund of all premiums paid for 30 days from delivery."),

    q("rp-01", "Replacement", "The replacement article, Insurance Code sections 10509 through 10509.09, exists to:", [
      "Ban all replacements",
      "Regulate replacement so the buyer gets enough information, and to set penalties for failing to comply",
      "Require every term policy to be replaced at renewal",
      "Eliminate the free look"
    ], 1, "Section 10509 says the article regulates replacement, assures the purchaser gets information, reduces misrepresentation and incomplete disclosure, and establishes penalties."),

    q("rp-02", "Replacement", "When a replacement is involved, the agent must present the Notice Regarding Replacement:", [
      "Within 30 days after the policy is delivered",
      "Not later than the time of taking the application, signed by the applicant and the agent, and left with the applicant",
      "Only if the applicant is over 80",
      "Only to the existing insurer"
    ], 1, "Section 10509.4 requires the notice not later than at the time of application. Both the applicant and the agent sign it, and it is left with the applicant."),

    q("rp-03", "Replacement", "The agent’s replacement paperwork must identify existing policies by:", [
      "The agent’s commission rate",
      "Insurer name, insured, and contract number, or another identification if no number exists yet",
      "Only the new policy’s illustration",
      "The beneficiary’s Social Security number only"
    ], 1, "Section 10509.4 requires a list of policies to be replaced, identified by insurer, insured, and contract number. If there is no contract number, an application or receipt number may be used."),

    q("rp-04", "Replacement", "The replacing insurer must send the existing insurer written notice of the replacement within:", [
      "Three working days of receiving the application in the home or regional office, or of issuing the policy, whichever is sooner",
      "One year",
      "The grace period",
      "Twenty days after a death claim"
    ], 0, "Section 10509.6 requires that written communication within three working days of receipt of the application in the home or regional office, or the date of issue, whichever is sooner."),

    q("rp-05", "Replacement", "An existing insurer that conserves a policy must give the policy owner a policy summary within:", [
      "3 working days",
      "20 days after it receives the replacement notice and required materials",
      "60 days",
      "6 months"
    ], 1, "Section 10509.6 gives the existing insurer 20 days from receipt of the communication and materials to furnish a policy summary."),

    q("rp-06", "Replacement", "Replacement records, including the notice and the replacement register, must be kept at least:", [
      "1 year",
      "3 years",
      "7 years",
      "Until the insured dies"
    ], 1, "Section 10509.6 requires evidence that the requirements were met to be maintained for at least three years."),

    q("rp-07", "Replacement", "An agent’s first violation of the replacement article carries an administrative penalty of:", [
      "No less than $1,000",
      "No less than $10,000",
      "A felony of up to five years",
      "No penalty if the client signed an illustration"
    ], 0, "Section 10509.9 sets an agent’s first violation at no less than $1,000. A second, later, or knowing violation is no less than $5,000 and no more than $50,000 for each violation."),

    q("rp-08", "Replacement", "An insurer’s first violation of the replacement article is:", [
      "$1,000",
      "$10,000",
      "$30,000 to $300,000",
      "License revocation with no hearing"
    ], 1, "Section 10509.9(c) sets the insurer’s first violation at $10,000. A knowing violation or a general business practice is no less than $30,000 and no more than $300,000 per violation. The Commissioner may suspend or revoke a license after a hearing."),

    q("il-01", "Illustrations", "Life insurance illustration rules the outline cites include which sections?", [
      "10509.950, 10509.955, 10509.957, and 10509.970 through 10509.975",
      "1631 and 1633 only",
      "10240 through 10252 only",
      "Title 18, sections 1033 and 1034"
    ], 0, "The outline lists those illustration sections. Section 10509.957 covers supplemental illustrations."),

    q("il-02", "Illustrations", "A compliant illustration must make which distinction clear?", [
      "Guaranteed elements versus non-guaranteed elements",
      "The agent’s commission versus the insured’s age",
      "Resident versus nonresident licensing only",
      "Per capita versus per stirpes"
    ], 0, "Non-guaranteed values cannot be presented as guaranteed. Supplemental illustrations are covered by section 10509.957 and still have to meet the illustration rules."),

    q("il-03", "Illustrations", "A buyer’s guide must be given:", [
      "Before the insurer accepts the initial premium or deposit, unless the policy has an unconditional refund of at least 10 days, in which case the guide may be delivered with the policy or before delivery",
      "Only after a claim is filed",
      "Only if the policy is variable",
      "Never, if an illustration is used"
    ], 0, "Section 10509.975 requires the buyer’s guide before the initial premium, with that 10-day unconditional-refund exception."),

    q("il-04", "Illustrations", "Cost indexes used to compare life policies include which of the following?", [
      "The surrender cost index and the net payment cost index",
      "The agent’s renewal commission rate",
      "Only the first-year premium",
      "The grace-period interest rate"
    ], 0, "The Life-Only objectives require you to identify cost indexes. The two standard ones are the surrender cost index and the net payment cost index. The outline also requires you to identify surrender charges and the surrender period."),

    q("dv-01", "Policy delivery", "Which method starts the statutory free-look period under section 10113.6?", [
      "Ordinary email with no receipt, in every case",
      "Registered or certified mail, personal delivery with a signed written receipt, first-class mail with a signed written receipt, or another method the Commissioner determines is reasonable",
      "Leaving the policy at the agent’s office",
      "A phone call describing the policy"
    ], 1, "Section 10113.6 lists those delivery methods. If the insurer uses another method, the insurer has the burden of proving delivery."),

    q("dv-02", "Policy delivery", "If premiums have been paid, a policy is deemed received:", [
      "The day it is printed",
      "Six months after the date of issuance",
      "On the insured’s next birthday",
      "Never, unless the agent signs"
    ], 1, "Section 10113.6(c) says a policy is deemed received six months after issuance if premiums have been paid."),

    q("dv-03", "Policy delivery", "The purpose of a delivery receipt is to:", [
      "Prove when the owner received the policy so the free-look period can be measured",
      "Replace the buyer’s guide",
      "Waive the incontestability period",
      "Assign the policy to the agent"
    ], 0, "A signed delivery receipt is evidence of when the owner received the policy. That date is what starts the right-to-return period."),

    q("ls-01", "Life settlements", "A life settlement contract is used to:", [
      "Sell an existing policy to a third party for more than the cash surrender value and less than the death benefit",
      "Buy a new term policy with no cash value",
      "Name a new beneficiary without the owner’s consent",
      "Avoid the grace period"
    ], 0, "A life settlement transfers the policy, for compensation, to someone who does not have an insurable interest in the usual family sense. The owner typically receives more than the surrender value and less than the death benefit. Sections 10113.1 through 10113.35 govern these contracts."),

    q("ls-02", "Life settlements", "Before recommending a life settlement, the agent should consider alternatives such as:", [
      "Keeping the policy, an accelerated death benefit, a policy loan, or a surrender",
      "Only a new variable universal life sale",
      "Commingling the proceeds with the agent’s funds",
      "A stranger-originated policy on someone the investor just met"
    ], 0, "The outline requires you to know possible alternatives. A settlement can be suitable only after those choices, and the client’s need for cash versus continued coverage, are considered."),

    q("ls-03", "Life settlements", "The owner may rescind a life settlement until the earlier of:", [
      "30 days after all parties sign and the owner has the required disclosures, or 15 days after the owner receives the proceeds",
      "10 days after the application",
      "The end of the contestability period",
      "One year after the insured dies"
    ], 0, "Sections 10113.2 and 10113.3 give that 30-day or 15-day period, whichever is sooner. Rescission is effective only if the owner gives notice and repays the proceeds and any premiums, loans, and loan interest."),

    q("ls-04", "Life settlements", "If the insured dies during the life-settlement rescission period:", [
      "The settlement becomes final and the provider keeps the death benefit with no repayment",
      "The contract is deemed rescinded, subject to repayment of proceeds, premiums, loans, and loan interest",
      "The free-look statute for buyers under 60 controls instead",
      "The agent may keep the death benefit"
    ], 1, "Sections 10113.2 and 10113.3 say that if the insured dies during the rescission period, the contract is deemed rescinded, subject to that repayment."),

    q("ls-05", "Life settlements", "Stranger-originated life insurance is:", [
      "A legitimate way to fund a funeral",
      "A fraudulent arrangement in which an investor causes a policy to be bought on a stranger so the investor can obtain the death benefit",
      "Required before a life settlement",
      "Another name for a survivorship policy"
    ], 1, "The outline requires you to know fraudulent life settlements, including stranger-originated life insurance. The policy is issued without a genuine insurance purpose."),

    q("ls-06", "Life settlements", "To transact a life settlement for a policy owner, a life agent must:", [
      "Have life-settlement authority under section 10113.2. A life agent does not do that work on a life license alone",
      "Only hold a property-casualty license",
      "Be the beneficiary",
      "Wait until the insured has died"
    ], 0, "The outline says a life agent must also be licensed as a life settlement broker to transact life settlements for an owner. The Department also allows a life agent licensed at least one year to file a life-settlement broker notification. Either way, life-agent authority alone is not enough."),

    q("ls-07", "Life settlements", "A life settlement broker represents:", [
      "The insurer",
      "The provider",
      "Only the owner, and owes the owner a fiduciary duty",
      "The beneficiary’s creditors"
    ], 2, "The Life-Only objectives quote sections 10113.1 and 10113.2: the broker represents only the owner and must act on the owner’s instructions and in the owner’s best interest."),

    q("pv-01", "Policy provisions", "The insuring clause is:", [
      "The insurer’s promise to pay the death benefit if the policy is in force and the conditions are met",
      "The owner’s right to skip premiums",
      "The suicide exclusion",
      "The buyer’s guide"
    ], 0, "The insuring clause is the company’s promise. The consideration clause is the owner’s part: the application and the premium."),

    q("pv-02", "Policy provisions", "The consideration clause refers to:", [
      "The application plus payment of the premium",
      "The Commissioner’s approval number only",
      "The agent’s appointment",
      "The spendthrift clause"
    ], 0, "Consideration is what the applicant gives for the insurer’s promise: the completed application and the premium."),

    q("pv-03", "Policy provisions", "Which right belongs to the policy owner while the insured is alive?", [
      "Choosing a settlement option after the death benefit is paid to someone else",
      "Assigning the policy, changing the premium mode, and changing a revocable beneficiary",
      "Waiving the two-year incontestability statute",
      "Shortening the 60-day grace period"
    ], 1, "The outline lists the owner’s rights as assignment, payment mode, beneficiary changes, conversion when the policy allows it, cash values, dividends, and surrender charges and periods."),

    q("pv-04", "Policy provisions", "A revocable beneficiary can be changed by the owner. An irrevocable beneficiary:", [
      "Can be removed at any time without that beneficiary’s consent",
      "Cannot be changed, and the policy generally cannot be assigned or surrendered, without that beneficiary’s consent",
      "Is always the insured’s estate",
      "Receives only dividends"
    ], 1, "An irrevocable designation gives the beneficiary a vested interest. The owner needs that person’s consent for changes that affect the designation."),

    q("pv-05", "Policy provisions", "Per stirpes and per capita differ how?", [
      "Per stirpes passes a deceased beneficiary’s share down that person’s branch. Per capita splits the benefit by the head among the living people named",
      "They are two names for the same result",
      "Per capita always pays the estate",
      "Per stirpes pays only creditors"
    ], 0, "Per stirpes means by the branch. Per capita means by the head. The outline requires you to tell them apart."),

    q("pv-06", "Policy provisions", "Under the Uniform Simultaneous Death Act, if the insured and the primary beneficiary die and the order cannot be proved, the law generally treats:", [
      "The beneficiary as having survived, so the beneficiary’s heirs take the proceeds",
      "The insured as having survived the beneficiary, so the proceeds go to the contingent beneficiary or the estate",
      "The policy as void",
      "The agent as the beneficiary"
    ], 1, "The common-disaster clause and the Uniform Simultaneous Death Act treat the insured as surviving, which keeps the proceeds from passing through the primary beneficiary’s estate when the order of death is unknown."),

    q("pv-07", "Policy provisions", "A spendthrift clause is used to:", [
      "Let the beneficiary’s creditors take the proceeds while the insurer still holds them",
      "Protect proceeds held by the insurer from the beneficiary’s creditors",
      "Cancel the policy if the insured has debts",
      "Convert term insurance to whole life"
    ], 1, "A spendthrift clause limits the beneficiary’s ability to assign proceeds, and it shields proceeds still held by the insurer from the beneficiary’s creditors."),

    q("pv-08", "Policy provisions", "California’s life-insurance incontestability rule in section 10113.5 is:", [
      "Two years, and fraud remains an exception after that",
      "Two years, with no fraud exception",
      "One year, with a fraud exception",
      "Five years"
    ], 1, "The outline states the rule directly: section 10113.5 is two years, with no fraud exception."),

    q("pv-09", "Policy provisions", "A misstatement of age or sex on a life policy usually results in:", [
      "A void policy from the start, with no benefit",
      "An adjustment of the benefit to the amount the premium would have bought at the correct age or sex",
      "A doubling of the face amount",
      "An automatic life settlement"
    ], 1, "The misstatement clause adjusts the proceeds. It does not void the contract the way a failed contestability defense might."),

    q("pv-10", "Policy provisions", "The entire contract, under section 10113, is:", [
      "The policy and the application attached to it",
      "The agent’s sales brochure",
      "The illustration alone",
      "The buyer’s guide alone"
    ], 0, "Section 10113 makes the policy and the application, if attached, the entire contract. Statements by the insured are representations, not warranties, in the absence of fraud."),

    q("pv-11", "Policy provisions", "“Representations, not warranties,” in section 10113 means:", [
      "An innocent misstatement is a warranty that voids the policy at any time",
      "In the absence of fraud, the insured’s statements are representations and not warranties",
      "The agent warrants the insured’s health",
      "Every application answer is a warranty for the life of the policy"
    ], 1, "Section 10113 says all statements purporting to be made by the insured shall, in the absence of fraud, be representations and not warranties."),

    q("pv-12", "Policy provisions", "Reinstatement of a lapsed life policy commonly requires:", [
      "Only a phone call",
      "Evidence of insurability and payment of back premiums with interest, within the time the policy allows, and the policy must not have been surrendered",
      "A new free-look period of 60 days in every case",
      "The beneficiary’s death"
    ], 1, "Reinstatement puts a lapsed policy back in force. Insurers require proof of insurability and payment of overdue premiums with interest, inside the contractual time limit. A surrendered policy is not reinstated."),

    q("pv-13", "Policy provisions", "Policy loans on life insurance are governed by Insurance Code sections 1230 through 1239.5. Variable life loan rules are also in:", [
      "Bulletin 87-3",
      "Section 777.1",
      "The anti-fraud video only",
      "Section 1749.01"
    ], 0, "The outline cites sections 1230 through 1239.5 for policy loans and Bulletin 87-3, page 15, for variable life loans."),

    q("pv-14", "Policy provisions", "An automatic premium loan does which of the following?", [
      "Borrows from the cash value to pay an overdue premium so the policy does not lapse, if the owner elected it and the cash value is sufficient",
      "Loans the death benefit to the agent",
      "Is required even when the policy has no cash value",
      "Replaces the grace period with a 10-day period"
    ], 0, "The automatic premium loan provision uses cash value as collateral for a loan that pays the premium. It works only if it was selected and there is enough value."),

    q("gr-01", "Grace period and lapse", "The minimum grace period on a life policy issued or delivered in California is:", [
      "30 days, running at the same time as coverage that is already paid",
      "Not less than 60 days from the premium due date, and that period does not run at the same time as the period of paid coverage",
      "10 days",
      "One year"
    ], 1, "Section 10113.71 requires a grace period of not less than 60 days. It does not run concurrently with the period of paid coverage, and the policy stays in force during the grace period."),

    q("gr-02", "Grace period and lapse", "A flexible-premium variable life policy’s grace period, under Bulletin 87-3, is:", [
      "31 days",
      "61 days",
      "90 days",
      "10 days"
    ], 1, "The outline cites Bulletin 87-3 for a 61-day grace period on flexible-premium variable life."),

    q("gr-03", "Grace period and lapse", "A notice of pending lapse and termination is effective only if it:", [
      "Is a text message from the agent",
      "Meets section 10113.71",
      "Is given after the policy has already terminated",
      "Goes only to the agent"
    ], 1, "The outline says notice of pending lapse and termination is not effective unless it complies with section 10113.71."),

    q("gr-04", "Grace period and lapse", "Before an individual life policy can lapse for nonpayment, the insurer must give at least 30 days’ notice to:", [
      "The policy owner only",
      "The policy owner and the named designee",
      "The Department of Insurance only",
      "The funeral home"
    ], 1, "Section 10113.72 says the policy shall not lapse or be terminated for nonpayment unless the insurer gives at least 30 days’ notice to the policyholder and the designee."),

    q("gr-05", "Grace period and lapse", "Before an individual life policy is issued or delivered in California, the applicant must be given:", [
      "The right to name at least one other person to receive lapse or termination notices, on a form the insurer provides",
      "A life settlement offer",
      "A variable separate account",
      "A waiver of the suicide clause"
    ], 0, "Section 10113.72 requires that right, the form, and a yearly notice of the right to make or change the designation."),

    q("gr-06", "Grace period and lapse", "Section 10113.71 says the lapse notice to the owner and designee is sent:", [
      "By first-class mail within 30 days after a premium is due and unpaid",
      "By telephone only",
      "After the policy has been dead for six months",
      "Only if the owner asks"
    ], 0, "Section 10113.71 requires first-class United States mail to the owner and the designee within 30 days after a premium is due and unpaid. Notice must also go out at least 30 days before termination."),

    q("nf-01", "Nonforfeiture", "The three nonforfeiture options are:", [
      "Cash surrender, reduced paid-up, and extended term",
      "Lump sum, fixed amount, and interest only",
      "Cash dividend, paid-up additions, and one-year term",
      "Per capita, per stirpes, and irrevocable"
    ], 0, "The outline lists cash surrender, reduced paid-up, and extended term. Settlement options and dividend options are different lists."),

    q("nf-02", "Nonforfeiture", "Reduced paid-up insurance gives the owner:", [
      "The same face amount for a shorter time",
      "A smaller amount of paid-up permanent insurance, with no more premiums due",
      "A full refund of every premium ever paid, plus interest",
      "Term insurance equal to the original face for life"
    ], 1, "Reduced paid-up uses the cash value as a net single premium to buy a smaller amount of permanent insurance. Extended term buys the same face amount for as long as the cash value will carry it."),

    q("nf-03", "Nonforfeiture", "Extended term uses the cash value to buy:", [
      "The original face amount as term insurance for a limited time",
      "A new variable universal life policy on a different insured",
      "An annuity for the agent",
      "A smaller whole life policy and a refund of all premiums"
    ], 0, "Extended term keeps the face amount and shortens the time. Reduced paid-up keeps lifetime coverage and reduces the face amount. Cash surrender ends the insurance and pays the cash value, minus any loan or surrender charge."),

    q("so-01", "Settlement options", "Interest-only settlement means:", [
      "The insurer holds the proceeds and pays interest, and the principal is paid later",
      "The beneficiary must take the full amount in cash within 10 days",
      "The death benefit is reduced to the cash value",
      "No interest is ever paid"
    ], 0, "Interest only leaves the principal with the insurer. The interest paid to the beneficiary is taxable. The principal itself generally remains income-tax free as life insurance proceeds."),

    q("so-02", "Settlement options", "A fixed-period option differs from a fixed-amount option because:", [
      "Fixed period pays for a chosen length of time. Fixed amount pays a chosen dollar amount until the proceeds are used up",
      "They are identical",
      "Fixed amount lasts for the beneficiary’s life with no refund",
      "Fixed period pays only interest"
    ], 0, "Fixed period sets the time. Fixed amount sets the check size, so the length depends on how long the money lasts. Life income pays for the payee’s lifetime."),

    q("so-03", "Settlement options", "A beneficiary who wants the highest immediate cash payment, with no insurer-held balance, chooses:", [
      "Interest only",
      "Lump sum",
      "Life income with a long period certain",
      "Extended term"
    ], 1, "Lump sum pays the proceeds at once. The other options leave money with the insurer in exchange for a stream of payments."),

    q("so-04", "Settlement options", "If an insurer does not pay life proceeds within 30 days after death, section 10172.5 requires:", [
      "A penalty paid to the Department equal to the face amount",
      "Interest, at not less than the rate then paid on death proceeds left on deposit, on amounts payable and unpaid after that 30 days",
      "Automatic reinstatement",
      "A new free-look period"
    ], 1, "Section 10172.5 requires that interest. The insurer should pay as soon as it reasonably can, and whenever possible within 30 days. Interest under this section is not required if the beneficiary elects in writing to take the proceeds other than as a lump sum."),

    q("so-05", "Settlement options", "A retained asset account under sections 10509.930 through 10509.938 is:", [
      "An FDIC-insured checking account at the beneficiary’s bank",
      "An account the insurer may use to hold proceeds, subject to disclosure rules, and the beneficiary can still demand a lump-sum payment",
      "Illegal in California",
      "A life settlement"
    ], 1, "A retained asset account holds the proceeds at the insurer and gives the beneficiary draft access. It is not a bank deposit. The statutes require specific disclosures, and the beneficiary is not forced to leave the money there."),

    q("di-01", "Dividends", "Which set is a list of dividend options?", [
      "Cash, accumulation at interest, paid-up additions, reduced premium, and one-year term",
      "Cash surrender, reduced paid-up, and extended term",
      "Lump sum, fixed period, and life income",
      "Primary, contingent, and irrevocable"
    ], 0, "Those five are the dividend options in the outline. Do not confuse them with nonforfeiture options or settlement options."),

    q("di-02", "Dividends", "Paid-up additions use the dividend to:", [
      "Buy small amounts of additional paid-up permanent insurance",
      "Pay the agent’s rent",
      "Shorten the grace period",
      "Convert the policy to term with no cash value"
    ], 0, "Paid-up additions buy more permanent insurance. The one-year term option buys temporary coverage, often in the amount of the cash value or another stated amount. Applying the dividend to premium simply reduces the cash the owner must pay."),

    q("di-03", "Dividends", "Interest credited on dividends left to accumulate is:", [
      "Never taxable",
      "Taxable, even though the dividend itself is generally a nontaxable return of premium until cost basis is recovered",
      "A capital gain in every case",
      "Deductible by the beneficiary"
    ], 1, "Dividends are generally a return of unused premium until they exceed the owner’s basis. Interest earned on dividends left on deposit is taxable."),

    q("ex-01", "Exclusions", "Common life policy exclusions in the outline include:", [
      "War or military service, aviation, and illegal activity",
      "Dying of natural causes after the contestability period",
      "Naming a spouse as beneficiary",
      "Paying premiums annually"
    ], 0, "The outline lists war or military service, aviation, and illegal activity. A hazardous hobby or occupation can also be excluded by endorsement."),

    q("ex-02", "Exclusions", "Suicide during the contestability period usually results in:", [
      "Payment of the full death benefit",
      "A refund of premiums, not payment of the death benefit",
      "A life settlement",
      "Double indemnity"
    ], 1, "The outline says suicide during the contestability period usually produces a refund of premiums, not the death benefit. After that period, the death benefit is paid. Variable life may include a two-year suicide exclusion under Bulletin 87-3."),

    q("ex-03", "Exclusions", "If a hazardous hobby is excluded by endorsement and death results from that hobby, the policy usually:", [
      "Pays the face amount",
      "Refunds the premiums",
      "Pays double the face amount",
      "Becomes a modified endowment contract"
    ], 1, "The outline says a hazardous-hobby or occupation exclusion can exclude that cause of death and result in a refund of premiums paid."),

    q("tx-01", "Taxation", "Personal life insurance premiums are generally:", [
      "Deductible on the owner’s federal income tax return",
      "Not deductible",
      "Taxable income to the beneficiary each year",
      "A credit against the estate tax in every estate"
    ], 1, "Personal life premiums are not deductible. Cash value generally grows tax deferred. The death benefit is generally income-tax free to the beneficiary under Internal Revenue Code section 101, with exceptions such as the transfer-for-value rule."),

    q("tx-02", "Taxation", "The gain when a cash-value policy is surrendered is generally:", [
      "Tax-free",
      "Ordinary income to the extent cash value exceeds the owner’s cost basis",
      "A capital loss",
      "Taxable to the insurer only"
    ], 1, "Surrender gain, cash value minus basis, is ordinary income. Matured endowment values are taxed when received to the extent they exceed basis."),

    q("tx-03", "Taxation", "Which exchange can qualify under Internal Revenue Code section 1035?", [
      "An annuity exchanged for a life insurance policy",
      "A life policy exchanged for another life policy, or a life policy exchanged for an annuity",
      "A cash surrender followed by a new application next year",
      "A life settlement to an investor"
    ], 1, "Section 1035 allows life-for-life, life-for-annuity, and annuity-for-annuity exchanges, among other permitted pairs. An annuity exchanged for a life policy does not qualify. The owner should not take the cash personally if the goal is a tax-free exchange."),

    q("tx-04", "Taxation", "A modified endowment contract’s tax taint:", [
      "Disappears after seven years of lower premiums",
      "Stays with the contract, and it can carry into a 1035 exchange",
      "Applies only to term insurance",
      "Makes the death benefit taxable in every case"
    ], 1, "Once a contract is a modified endowment contract, it stays one. Exchanging it does not wash off that status."),

    q("su-01", "Suitability", "Suitability means the recommendation:", [
      "Pays the highest commission",
      "Fits the consumer’s financial situation, insurance needs, and objectives",
      "Is always whole life, regardless of budget",
      "Replaces every existing policy"
    ], 1, "The outline requires a definition of suitability and the producer’s legal and ethical duty to the consumer, the insurer, and regulators. The product has to fit the person, not the commission."),

    q("su-02", "Suitability", "Before recommending a nonterm life policy, the producer should learn which kinds of facts?", [
      "Only the consumer’s favorite rider",
      "Financial situation, needs, objectives, existing coverage, time horizon, liquidity, risk tolerance, and tax situation",
      "Only the consumer’s age",
      "The consumer’s voting record"
    ], 1, "The outline says you must know what information is required to support a suitable recommendation. Those facts are the core of that inquiry. The Life-Only annuity suitability list in section 10509.913 is the same kind of fact-finding."),

    q("su-03", "Suitability", "Which recommendation is unsuitable?", [
      "Permanent insurance for a person who can pay for it and wants lifelong coverage and cash value",
      "Variable universal life for a person who needs a guaranteed death benefit and cannot accept investment losses",
      "Term insurance for a temporary need the client can afford",
      "Explaining surrender charges before the client replaces a policy"
    ], 1, "Variable universal life puts cash value in a separate account. It does not fit someone who needs guarantees and cannot bear market loss. A replacement made for the commission, without a fair comparison, is also unsuitable."),

    q("su-04", "Suitability", "Producers who sell these policies are subject to:", [
      "No supervision once they are licensed",
      "Audit and supervision of their sales activity",
      "Review only after a death claim",
      "Supervision only if they sell term insurance"
    ], 1, "The outline says you must understand the processes used to audit and supervise producer activity, and you must be able to identify suitability violations."),

    q("su-05", "Suitability", "Special senior-consumer rules in Insurance Code sections 785 through 789.10 apply to a senior who is:", [
      "60 or older, the same age as the enhanced free look",
      "65 or older",
      "70 or older",
      "Any buyer of term insurance"
    ], 1, "Sections 785 through 789.10 are the senior-insurance article, and a senior there is a person 65 or older. The enhanced free look in section 10127.10 uses a different age: 60 or older on the purchase date."),

    q("su-06", "Suitability", "An ethical duty the Life-Only objectives say is tested is:", [
      "Place the customer’s interest first, recommend what meets the customer’s needs, and do not make unfair remarks about competitors",
      "Maximize replacements",
      "Hide surrender charges if the client does not ask",
      "Treat the Insurance Code as a complete guide to ethics, so anything not forbidden is fine"
    ], 0, "The objectives list those duties. They also say the Insurance Code and the regulations identify many illegal practices but are not a complete guide to ethical behavior."),

    q("bm-01", "Business management", "Which training is prohibited in approved prelicensing and continuing-education courses by section 1749.1?", [
      "Accounting, trust-account reconciliation, and complaint handling",
      "Sales training, motivational training, self-improvement training, and insurer or agent training on new products or programs",
      "Privacy and recordkeeping",
      "How to explain a grace period"
    ], 1, "Section 1749.1(b), quoted in the Life-Only objectives, prohibits those sales and motivational topics. The four-hour outline repeats that prohibition and then lists proper business-management subjects such as accounting, information security, hiring and licensing, complaint handling, and communication."),

    q("bm-02", "Business management", "Trust-account maintenance and reconciliation belong under which heading in this course?", [
      "A banned sales meeting",
      "Business-management education on accounting and financial management",
      "The anti-fraud hour",
      "A life settlement"
    ], 1, "The outline puts trust accounts, reconciliation, auditing, financial statements, budgeting, and business continuation under business management."),

    q("ut-01", "Unfair practices", "Commingling means:", [
      "Mixing a client’s premium money with the agent’s personal funds",
      "Naming two beneficiaries",
      "Combining term and whole life in one comparison",
      "Mailing a lapse notice"
    ], 0, "The outline defines commingling as mixing personal funds with the client’s money. Charging more than the premium and keeping the excess, and charging for coverage that is not in effect, are the other illegal premium-handling examples it lists."),

    q("ut-02", "Unfair practices", "Twisting, under sections 780 through 784, is:", [
      "A fair comparison that causes a client to keep a policy",
      "Misrepresentation used to induce a person to lapse, forfeit, or surrender existing insurance",
      "A required replacement notice",
      "A dividend option"
    ], 1, "Misrepresentation of policy terms, benefits, or dividends is illegal under sections 780 through 784. Twisting is that kind of misrepresentation aimed at getting someone to drop insurance they already have."),

    q("ut-03", "Unfair practices", "Concealment, under section 330, is:", [
      "Neglect to communicate what a party knows and ought to communicate",
      "A statement that is literally true",
      "Delivery of the buyer’s guide",
      "Paying a claim within 30 days"
    ], 0, "Section 330 defines concealment that way. Section 331 says concealment, whether intentional or unintentional, entitles the injured party to rescind. Information that is already known, that should be known, or that the other party waived does not have to be communicated."),

    q("ut-04", "Unfair practices", "Rebating and illegal inducement are:", [
      "Allowed if the client asks",
      "Prohibited advantages that are not stated in the policy, offered to make someone buy",
      "Required on replacements",
      "The same thing as a policy loan"
    ], 1, "Rebating is giving part of the commission or something of value that the policy does not provide. An illegal inducement is a similar banned incentive. Both are unfair trade practices."),

    q("ut-05", "Unfair practices", "Free insurance under section 777.1 is:", [
      "Allowed as a gift to induce the purchase of goods or services, with no limits",
      "Restricted. Insurance generally may not be offered free as an inducement to buy something else, except as the statute allows",
      "Required on every life sale to a senior",
      "Another name for waiver of premium"
    ], 1, "Section 777.1 restricts free insurance used as an inducement. The outline lists it among unfair-practice prohibitions."),

    q("ut-06", "Unfair practices", "Defamation in the insurance trade-practices sense is:", [
      "A true comparison of two policies’ surrender charges",
      "A false or malicious statement about an insurer’s financial condition, or about a person in the insurance business, that is meant to injure",
      "Filing a complaint with the Department",
      "Disclosing a privacy notice"
    ], 1, "Defamation here is a false statement calculated to injure an insurer or a person engaged in insurance. It is listed with boycott, coercion, and intimidation as a prohibited practice."),

    q("ut-07", "Unfair practices", "Which license problem does the outline put with Insurance Code section 35?", [
      "Transacting without a license, transacting outside the license, getting a license only to write controlled business, and getting a license by fraud",
      "A late continuing-education hour that is later completed",
      "Naming an irrevocable beneficiary",
      "Using a buyer’s guide"
    ], 0, "The outline groups those license violations under that heading. Controlled business means the license would be used mainly to insure the applicant’s own interests, family, or employer rather than the public."),

    q("ut-08", "Unfair practices", "False advertising and false entries are prohibited because they:", [
      "Are required in every illustration",
      "Misstate the financial condition of an insurer or the terms of a policy, or put false information in the books",
      "Are the same as a delivery receipt",
      "Apply only to health insurance"
    ], 1, "The outline lists false information and advertising, and false statements and entries, among unfair practices. A statement in an advertisement has to be true."),

    q("ut-09", "Unfair practices", "Unfair discrimination means:", [
      "Charging a different rate for a different age or risk class when the difference is actuarially justified",
      "Treating people in the same class differently, or refusing insurance, for a reason the Insurance Code forbids",
      "Asking health questions",
      "Using a mortality table"
    ], 1, "Discrimination between people of the same class and hazard is an unfair practice. A real difference in risk, such as age, is not by itself illegal discrimination. Sections 10140 through 10145 also restrict specific discriminatory practices."),

    q("pn-01", "Penalties", "Insurance Code section 35 defines “transact” to include:", [
      "Solicitation, negotiations preliminary to execution, execution of the contract, and transactions after execution that arise out of it",
      "Only the delivery of a claim check",
      "Only advertising by an admitted insurer",
      "Studying for the license exam"
    ], 0, "Those four acts are section 35. The definition matters because a person who solicits or negotiates is already transacting and needs a license."),

    q("pn-02", "Penalties", "Section 1631 and section 1633 together say:", [
      "An unlicensed person may solicit if no premium is collected",
      "An unlicensed person shall not solicit, negotiate, or effect insurance, and doing so is a misdemeanor punishable by a fine of up to $50,000, up to one year in county jail, or both",
      "The only penalty is a warning letter",
      "The penalty is a civil fine of $500 and nothing else"
    ], 1, "Section 1631 is the prohibition. Section 1633 makes the act a misdemeanor with a fine not exceeding $50,000, county jail not exceeding one year, or both."),

    q("pn-03", "Penalties", "A person convicted of a felony involving dishonesty or a breach of trust who wants to work in the business of insurance affecting interstate commerce must:", [
      "Do nothing, because state licensing erases the conviction",
      "Obtain the written consent required by 18 U.S.C. section 1033. Sections 1033 and 1034 also provide criminal and civil penalties",
      "Wait 30 days and begin soliciting",
      "File only a change-of-address form"
    ], 1, "The outline requires you to know 18 U.S.C. sections 1033 and 1034. A prohibited person needs written consent before engaging in the business of insurance that affects interstate commerce. Acting without it is a crime, and section 1034 adds civil penalties."),

    q("pn-04", "Penalties", "Acting as an agent for a nonadmitted insurer, unless an exception such as a surplus-line broker applies, is:", [
      "A misdemeanor, plus a forfeiture of $500 and $100 for each month or fraction of a month the violation continues",
      "Allowed for any life agent",
      "Punished only by a $1 civil fine",
      "Required on every replacement"
    ], 0, "Section 703 makes those acts misdemeanors and adds the $500 forfeiture plus $100 per month. Advertising a nonadmitted insurer and aiding one to transact insurance are in the same section."),

    q("pn-05", "Penalties", "Who may enforce the Unfair Practices Act, sections 790 through 790.15?", [
      "Any consumer, in a private lawsuit under that article",
      "Only the Insurance Commissioner",
      "Only the local district attorney, with no role for the Commissioner",
      "The life settlement provider"
    ], 1, "The outline and the Life-Only objectives both say only the Commissioner may enforce the Unfair Practices Act. The Commissioner may also hold hearings to identify additional unfair acts and decide how they will be enforced."),

    q("pn-06", "Penalties", "A civil penalty for an unfair practice under section 790.035 is:", [
      "Up to $5,000 for each act, or up to $10,000 for each act if the act was willful",
      "Exactly $50,000 in every case",
      "There is no money penalty",
      "Up to $300,000 for an agent’s first replacement violation"
    ], 0, "Section 790.035 authorizes a civil penalty fixed by the Commissioner, not to exceed $5,000 per act, or $10,000 per act if willful. A violation of a final cease-and-desist order is handled under section 790.07 and can be higher."),

    q("pn-07", "Penalties", "The Gramm-Leach-Bliley Act and the California Financial Information Privacy Act, Financial Code sections 4050 through 4060, deal with:", [
      "How financial institutions collect, share, and protect customers’ nonpublic personal information",
      "The 60-day grace period",
      "Illustration cost indexes",
      "The seven-pay test"
    ], 0, "The outline pairs GLBA with California’s Financial Information Privacy Act. California’s rules on sharing with nonaffiliates are stricter than the federal opt-out baseline. Institutions also have to safeguard customer information."),

    q("pn-08", "Penalties", "The Insurance Information and Privacy Protection Act, sections 791 through 791.26, gives a consumer which rights?", [
      "No right to see information an insurer collected",
      "Notice of the insurer’s information practices, access to recorded personal information, a chance to correct it, and limits on disclosure. Pretext interviews are prohibited",
      "The right to have the agent hide an adverse underwriting decision",
      "A right to the insurer’s reserve formula"
    ], 1, "Sections 791 through 791.26 cover those privacy practices, prohibitions, and penalties. A pretext interview, addressed in section 791.03, is a particular concern when dealing with seniors."),

    q("pn-09", "Penalties", "A producer’s fiduciary duty under sections 1733 through 1735 means premium money is:", [
      "The agent’s money as soon as it is collected",
      "Held in a fiduciary capacity and not available for personal use",
      "Payable to the beneficiary",
      "Optional to remit"
    ], 1, "Premiums are trust funds. Using them personally is a breach of fiduciary duty and fits the outline’s ban on illegal handling of premiums."),

    q("pn-10", "Penalties", "There is no license called a life solicitor. An insurance solicitor, under section 1624, may:", [
      "Transact life insurance independently",
      "Aid an agent or broker in transacting insurance other than life, disability, or health",
      "Approve a life settlement",
      "Waive the free look"
    ], 1, "The Life-Only objectives say there is no life solicitor license, section 1704(d). A solicitor helps transact lines other than life, disability, or health. There is also no life broker. A life licensee acts as an agent of the insurer."),

    q("pn-11", "Penalties", "Boycott, coercion, and intimidation in this course are:", [
      "Ordinary sales enthusiasm",
      "Unfair methods of competition. A person may not be forced into an insurance purchase, or into dropping one, by those means",
      "Required conservation tools",
      "Dividend options"
    ], 1, "The outline lists coercion, intimidation, and boycott as separate prohibitions under unfair trade practices. They are not negotiation tactics an agent may use."),

    q("pm-04", "Premium modes", "The initial premium and the guaranteed maximum premium on a flexible or indeterminate policy are different because:", [
      "The initial premium is what is charged now. The guaranteed maximum is the highest amount the policy is allowed to charge later",
      "They are always the same number",
      "The guaranteed maximum is the agent’s commission",
      "The initial premium is paid only if the insured dies"
    ], 0, "The outline lists both. A current or initial charge can be lower than the contractual maximum. An illustration has to show that the lower figure is not a guarantee."),

    q("ut-10", "Unfair practices", "A sales-and-loan abuse in this course is which of the following?", [
      "Requiring a borrower to buy insurance from a particular agent or insurer as a condition of getting the loan, when that tie-in is not allowed",
      "Explaining that a policy loan uses cash value as collateral",
      "Showing the surrender charge in an illustration",
      "Giving the replacement notice at application"
    ], 0, "The outline lists sales and loan requirements among the unfair-practice prohibitions. Forcing insurance as a condition of credit is not the same thing as a policy loan the owner asks for."),

    q("pn-12", "Penalties", "Unfair financial-planning practices include:", [
      "Holding out as a financial planner in a way that hides that the person is selling insurance, or using a planning engagement to twist a client into a policy",
      "Giving the buyer’s guide",
      "Explaining a surrender charge",
      "Keeping a replacement register for three years"
    ], 0, "The outline names unfair financial-planning practices as a prohibition. The client has to know when a planning conversation is really an insurance sale, and the recommendation still has to be suitable.")
  ];
})();
