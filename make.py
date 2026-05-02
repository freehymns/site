import binascii
import os
import os.path
import shutil
import string
import sys
import time

ENCODING = "iso-8859-1"

build = None
hymns_dir = "../hymns"
out_dir = None

if len(sys.argv) > 1 and (sys.argv[1] == "indexes" or sys.argv[1] == "all"):
	build = sys.argv[1]
if len(sys.argv) > 2:
	hymns_dir = sys.argv[2]
if len(sys.argv) > 3:
	out_dir = sys.argv[2]
if build is None:
	print("Syntax: " + sys.argv[0] + " indexes|all [hymns_dir [out_dir]]")
	exit()
	
if out_dir is None:
	out_dir = ("target" if build == "all" else ".")

CleanWords = str.maketrans("è“”’%-\"", "e~~~~~~")
EndLine = str.maketrans(",;:", "...")
PunctuationRemover = str.maketrans("", "", string.punctuation)

def readfile(filename):
	content = ""
	with open(filename, encoding=ENCODING) as f:
		for line in f.readlines():
			content += line
	return content

def get_dirname(id):
	dir = id[0].lower()
	if (id[0] == "A" and (id[1].isupper() or (id[1] == "n" and id[2].isupper()))):
		dir += "n"
	if (id[0] == "I" and id[1].isupper()):
		dir += "_"
	if (id[0] == "O" and (id[1].isupper() or (id[1] == "h" and id[2].isupper()))):
		dir += "h"
	elif (id[0:3] == "The" and id[3].isupper()):
		dir += "he"
	return dir
	
hymn_html = readfile("0/hymn.html")

abc2svg_crc = os.path.getmtime("abc2svg/abc2svg-1.js")
abc2svg_crc += os.path.getmtime("abc2svg/abcweb-1.js")
abc2svg_crc += os.path.getmtime("abc2svg/MIDI-1.js")
abc2svg_crc += os.path.getmtime("abc2svg/snd-1.js")
abc2svg_crc = str(binascii.crc32(str(abc2svg_crc).encode()))
hymn_html = hymn_html.replace("abc2svg-1.js?", "abc2svg-1.js?" + abc2svg_crc)
hymn_html = hymn_html.replace("abcweb-1.js?", "abcweb-1.js?" + abc2svg_crc)
hymn_html = hymn_html.replace("snd-1.js?", "snd-1.js?" + abc2svg_crc)

hymn_js_crc = os.path.getmtime("hymn.js")
hymn_js_crc = str(binascii.crc32(str(hymn_js_crc).encode()))
hymn_html = hymn_html.replace("hymn.js?", "hymn.js?" + hymn_js_crc)

hymn_css_crc = os.path.getmtime("hymn.css")
hymn_css_crc = str(binascii.crc32(str(hymn_css_crc).encode()))
hymn_html = hymn_html.replace("hymn.css?", "hymn.css?" + hymn_css_crc)

current_crc = str(binascii.crc32(time.ctime().encode()))

hymn_files = []

if build == "all":
	os.makedirs(out_dir + "/en", exist_ok=True)

for path in os.listdir(hymns_dir + "/en"):
	for path2 in os.listdir(hymns_dir + "/en/" + path):
		hymn_files.append(path + "/" + path2)

hymn_ids = []
topics_by_id = {}
ids_by_title = {}
first_line_flag_by_title = {}

for hymn_file in hymn_files:
	print(hymn_file + ":")

	hymn_id = hymn_file.split("/")[1].split(".")[0]
	hymn_ids.append(hymn_id)
	new_html = hymn_html.replace('//data.textID = ""', 'data.textID = "' + hymn_id + '"')
	new_html = new_html.replace('<a id="download_text" href="tbd', '<a id="download_text" href="' + '../hymns/en/' + hymn_file)
	new_html = new_html.replace("titles.html?", "titles.html?" + current_crc)

	tune_id = None
	topics_by_id[hymn_id] = []
	txt = None
	first_line = None
	fl_flag = 0
	index = 2
	with open(hymns_dir + "/en/" + hymn_file, encoding=ENCODING) as f:
		line = f.readline()
		title = line.strip()
		new_html = new_html.replace("<title>Hymn Title</title>", "<title>" + title + "</title>")
		txt = line
		while len(line) > 0:
			line = f.readline()
			txt += line
			if first_line is None and len(line) > 2 and line.find(":@") < 0 and (not line.strip().endswith(":")):
				first_line = line.translate(CleanWords).replace("~","").strip()
				first_line = first_line[0:-1] + first_line[-1:].translate(EndLine).replace(".","")
				if first_line.translate(PunctuationRemover).lower().startswith(title.translate(PunctuationRemover).lower()):
					fl_flag = 2
				else:
					fl_flag = 1
			if tune_id == None and line[0:5] == "Tune:":
				tune_id = line[5:].strip()
			if line[0:6] == "Topic:":
				topics_by_id[hymn_id].append(line[6:].strip())
			if line[0:6] == "Index:":
				if line.lower().find("no") > 0:
					index = 0
				if line.lower().find("title only") > 0:
					index = 1

	suffix = ""
	if index >= 1:
		i = 1
		while (title + suffix) in ids_by_title:
			i += 1
			suffix = " (" + str(i) + ")"
		ids_by_title[title + suffix] = hymn_id
		first_line_flag_by_title[title + suffix] = 0

	if index == 2:
		fl_suffix = ""
		i = 1
		while (first_line + fl_suffix) in ids_by_title:
			i += 1
			fl_suffix = " (" + str(i) + ")"
		if fl_flag == 1:
			ids_by_title[first_line + fl_suffix] = hymn_id
			first_line_flag_by_title[first_line + fl_suffix] = 1
		else:
			first_line_flag_by_title[title + suffix] = 2

	i = new_html.find("text_data")
	if new_html[i-1] == "x":
		new_html = new_html[0:i-1] + new_html[i:]
	i = new_html.find(">", i) + 1
	new_html = new_html[0:i] + txt + new_html[i:]

	if (tune_id == None):
		tune_id = hymn_id
	new_html = new_html.replace('//data.musicID = ""', 'data.musicID = "' + tune_id + '"')

	tune_path = "music/" + get_dirname(tune_id) + "/" + tune_id + ".abc"
	new_html = new_html.replace('<a id="download_music" href="tbd', '<a id="download_music" href="' + '../hymns/' + tune_path)

	music = readfile(hymns_dir + "/" + tune_path)

	i = new_html.find("music_data")
	if new_html[i-1] == "x":
		new_html = new_html[0:i-1] + new_html[i:]
	i = new_html.find(">", i) + 1
	new_html = new_html[0:i] + music + new_html[i:]

	if build == "all":
		with open(out_dir + "/en/" + hymn_id + ".html", "w", encoding=ENCODING) as out:
			out.write(new_html);

titles_html = ""
with open("titles_template.html", encoding=ENCODING) as f:
	line = f.readline()
	while len(line) > 0:
		if line.find("$LINK") >= 0:
			for title in sorted(ids_by_title.keys()):
				id = ids_by_title[title]
				link = ("0/hymn.html?id=" + id if out_dir == "." else "en/" + id + ".html")
				new_line = line.replace("$LINK", link)
				for topic in topics_by_id[id]:
					new_line = new_line.replace("$TOPICS", topic)
				new_line = new_line.replace("$TOPICS", "")
				new_line = new_line.replace("$TITLE", title);
				if first_line_flag_by_title[title] == 1:
					new_line = new_line.replace("span", "i")
				elif first_line_flag_by_title[title] == 2:
					new_line = new_line.replace("span", "b")
				titles_html += new_line
		else:
			titles_html += line
		line = f.readline()
	
indexes_js_crc = os.path.getmtime("indexes.js")
indexes_js_crc = str(binascii.crc32(str(indexes_js_crc).encode()))
titles_html = titles_html.replace("indexes.js?", "indexes.js?" + indexes_js_crc)

index_file = out_dir + "/" + "titles.html"
with open(index_file, "w", encoding=ENCODING) as out:
	out.write(titles_html);


if build == "all":
	index_html = readfile("index.html")
	index_html = index_html.replace("titles.html?", "titles.html?" + current_crc + "&")
	index_file = out_dir + "/" + "index.html"
	with open(index_file, "w", encoding=ENCODING) as out:
		out.write(index_html);

	shutil.copytree(hymns_dir, out_dir + "/hymns", ignore=shutil.ignore_patterns(".*", "*.b*", "Copy of *"), dirs_exist_ok=True)
	#if not os.path.exists(out_dir + "/abc2svg/Scc1t2"):
	#	shutil.copytree("abc2svg/Scc1t2", out_dir + "/abc2svg/Scc1t2")
	shutil.copy2("abc2svg/abc2svg-1.js", out_dir + "/abc2svg")
	shutil.copy2("abc2svg/abc2svg.ttf", out_dir + "/abc2svg")
	shutil.copy2("abc2svg/abcweb-1.js", out_dir + "/abc2svg")
	shutil.copy2("abc2svg/combine-1.js", out_dir + "/abc2svg")
	#shutil.copy2("abc2svg/MIDI-1.js", out_dir + "/abc2svg")
	shutil.copy2("abc2svg/snd-1.js", out_dir + "/abc2svg")
	shutil.copy2("akai_steinway.sf2", out_dir)
	shutil.copy2("contact.png", out_dir)
	shutil.copy2("favicon.png", out_dir)
	shutil.copy2("hymn.css", out_dir)
	shutil.copy2("hymn.js", out_dir)
	shutil.copy2("hymnsing.jpg", out_dir)
	shutil.copy2("indexes.css", out_dir)
	shutil.copy2("indexes.js", out_dir)
	shutil.copy2("NoSleep.min.js", out_dir)
