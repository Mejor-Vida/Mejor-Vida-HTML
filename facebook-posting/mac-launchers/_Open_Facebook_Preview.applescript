on run
	set repoPath to "/Users/mejorvidainsurance/Desktop/mejor-vida-html /Mejor-Vida-HTML/facebook-posting"
	tell application "Terminal"
		activate
		do script "cd " & quoted form of repoPath & " && ( sleep 1; for i in $(seq 1 50); do /usr/bin/curl -sf -o /dev/null http://127.0.0.1:8765/post-preview.html && break; sleep 0.5; done; /usr/bin/open http://127.0.0.1:8765/post-preview.html ) & python3 dev_preview.py"
	end tell
end run
