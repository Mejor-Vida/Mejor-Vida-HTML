on run
	set bashScript to "/usr/bin/pkill -f dev_preview.py 2>/dev/null; pids=$(/usr/sbin/lsof -ti:8765 2>/dev/null); [ -n \"$pids\" ] && /bin/kill -15 $pids 2>/dev/null; exit 0"
	try
		do shell script "/bin/bash -lc " & quoted form of bashScript
	end try
	display notification "Facebook Preview server stopped (port 8765)." with title "Stop Facebook Preview"
end run
