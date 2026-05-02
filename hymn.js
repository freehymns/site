/*
Copyright (c) 2026 freehymns.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const INLINE = "inline";
const BLOCK = "block";
const NONE = "none";
const INLINE_BLOCK = INLINE + "-" + BLOCK;

const SCORE = "score";
const TEXT = "text";
const PRESENTATION = "presentation";

const PLUS = "+";
const NDASH = "&ndash;";

const TITLE = "Title";
const AUTHOR = "Author";
const COMPOSER = "Composer";
const METER = "Meter";
const TOPIC = "Topic";
const TUNE = "Tune";
const TERMS = "Terms";
const TEMPO = "Tempo";
const KEYSIG = "Key";

const TREBEL = 0;
const HI_TREBEL = 1;
const BASS = -1;
const LO_BASS = -2;

const IN_SCORE = 0;
const AFTER_SCORE = 1
const HIDE_VESRSE = 2;
const REMOVE_VERSE = 3;

const HYMN = "hymn";
const CODES = "codes";

const FIELD_NAME_LIMIT = 13;
const FIELD_VALUE_LIMIT = 24;
const RADIO_VALUE_LIMIT = 32;

const NULL_ABC = "X:1\nK:C\nV:1\nz";

const BOTS = [/bot/i,/spider/i,/crawler/i,/Google-InspectionTool/,/GoogleOther/,/Slurp/,/Teoma/,/speedy/,/Qwantify/,/Seekport/,/search\.marginalia\.nu/,/webzio\s/,/GeedoProductSearch/];

const KEY_TABLE = [
	{accidentals:0, steps:0, major: "C", minor: "A"},
	{accidentals:-5, steps:1, major: "Db", minor: "Bb"},
	{accidentals:2, steps:2, major: "D", minor: "B"},
	{accidentals:-3, steps:3, major: "Eb", minor: "C"},
	{accidentals:4, steps:4, major: "E", minor: "C#"},
	{accidentals:-1, steps:5, major: "F", minor: "D"},
	{accidentals:6, steps:6, major: "F#", minor: "D#"},
	{accidentals:1, steps:7, major: "G", minor: "E"},
	{accidentals:-4, steps:8, major: "Ab", minor: "F"},
	{accidentals:3, steps:9, major: "A", minor: "F#"},
	{accidentals:-2, steps:10, major: "Bb", minor: "G"},
	{accidentals:5, steps:11, major: "B", minor: "G#"},
	{accidentals:0, steps:12, major: "C", minor: "A"}
];

const DEBUG_LAYOUT = window.location.href.indexOf("DebugLayout") > 0;

const ON_LOCALHOST = ("localhost,127.0.0.1".indexOf(window.location.hostname) >= 0);

const log = (ON_LOCALHOST ? console.log : (msg) => null);

var noSleep = new NoSleep();

var data = {};
var opts = {wordsShown:HYMN, breakOnlyOnBars:false, forceSpaceBetweenWords:false, manageBreaksAndSpacing:true};

var Col1;
var Col1_top;
var Col2;
var Col2_top;
var Col2_site_icon;
var Col2_title;
var Col2_arrow;
var Col3;
var Col3_top;
var Col3_site_icon;
var Col3_double_arrow;
var Col3_arrow;
var Score_view;
var Text_view;
var Presentation_view;
var Present_header;
var Present_main;
var Present_footer;
var Tempo_value
var Play_pause_resume;
var Reset;
var Indexframe;

var Col1_top_rect;
var Col1_width;
var ColSpacer_width;

var KeyboardDetected = false;
var BotDetected = false;

var Pagesize;
var Best_layout;
var View = TEXT;
var tempo = 100;
var col1_dismissed = true;
var col2_dismissed = true;
var col3_dismissed = false;
var nextPlayStepScheduled = false;
var end_svg = null;
var plan_remaining = "";
var playing = false;
//var wakelock = null;

var abc_seq = 1;

var fully_loaded = false;

function log_try(fname, tryno) {
	if (tryno != null) {
		log(fname + ", try" + tryno);
	}
}

function space_for_cols(_col1_dismissed, _col2_dismissed, _col3_dismissed, _view) {
	if (_col1_dismissed && _col2_dismissed && _col3_dismissed) {
		return true;
	} else if (_col1_dismissed && _col2_dismissed && !_col3_dismissed) {
		return (_view == TEXT || window.innerWidth >= 850);
	} else if (_col1_dismissed && !_col2_dismissed && _col3_dismissed) {
		return (window.innerWidth >= Col1_width);
	} else if (_col1_dismissed && !_col2_dismissed && !_col3_dismissed) {
		return ((_view == TEXT && window.innerWidth >= Col1_width * 2) || (_view == SCORE && window.innerWidth >= Col1_width + 850));
	} else if (!_col1_dismissed && _col2_dismissed && _col3_dismissed) {
		return (window.innerWidth >= Col1_width);
	} else if (!_col1_dismissed && _col2_dismissed && !_col3_dismissed) {
		return ((_view == TEXT && window.innerWidth >= Col1_width * 2) || (_view == SCORE && window.innerWidth >= Col1_width + 850));
	} else if (!_col1_dismissed && !_col2_dismissed && _col3_dismissed) {
		return (window.innerWidth >= Col1_width * 2);
	} else if (!_col1_dismissed && !_col2_dismissed && !_col3_dismissed) {
		return ((_view == TEXT && window.innerWidth >= Col1_width * 3) || (_view == SCORE && window.innerWidth >= Col1_width * 2 + 850));
	}
}

function isAlpha(ch){
  return (ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z");
}

function isDigit(ch){
  return (ch >= "0" && ch <= "9");
}

function normalizeSpace(s) {
	return s.replace(/\s+/g, ' ').trim();
}

function encodeSpecials(str) {
	s = str;
	s = s.replace("\\-", "{dash}");
	s = s.replace("\\*", "{star}");
	s = s.replace("\\%", "{pcnt}");
	s = s.replace("\\_", "{uscr}");
	s = s.replace("\\=", "{equl}");
	s = s.replace("\\/", "{slsh}");
	s = s.replace("\\\\", "{bssh}");
	return s;
}

function decodeSpecials(str, use_backslash) {
	s = str;
	var bs = (use_backslash ? "\\" : "");
	s = s.replace("{dash}", bs + "-");
	s = s.replace("{star}", bs + "*");
	s = s.replace("{pcnt}", bs + "%");
	s = s.replace("{uscr}", bs + "_");
	s = s.replace("{equl}", bs + "=");
	s = s.replace("{slsh}", bs + "/");
	s = s.replace("{bssh}", bs + "\\");
	return s;
}

function addFieldValue(variable, field, value) {
	if (variable[field] == null) {
		variable[field] = [value];
	} else {
		variable[field].push(value);
	}
}

function getFieldValues(variable, field) {
	if (variable[field] == null) {
		return null;
	} else {
		var value = variable[field][0];
		for (var i = 1; i < variable[field].length; i++) {
			value += ", " + variable[field][i];
		}
		return value;
	}
}

function parse_text_data() {
	data.ties = null;
	data.rests = null;
	data.verseCount =  0;
	data.stanzas = [ /*
		{
			partname: "Verse";
			description: "Verse 1",
			verseNos: [], // Verse numbers these words apply to.  If the array is empty they apply to all verses (print in the middle of the staves).  If it includes 0, print below the bass stave instead of between the staves.
			clef: 0,      //0 = trebel, 1 = hi trebel, -1 = bass, -2 = low bass
			lines: []
			map: {A1: "Twink-", A2: "le", A3: "twink-", A4: "le" A5: "lit-", A6: "tle", A7: "star."}
			firstCodeLetter: "A",
		} */
	];
	data.text_fields = {
		//keyword: ["value1", "value2"]
	};
	var normalized = data.raw_text.replaceAll("\r\n", "\n").replaceAll("\r", "\n").replaceAll(/#.+\n/g, "");
	var lines = normalized.split("\n");
	console.assert(lines.length > 0, "No lines");
	console.assert(lines[1].length == 0, "Second line not blank");
	console.assert(normalized.indexOf("\n\n---") > 0, "No dash lines");

	var variant = null;
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].substring(0,3) == "---") {
			variant = lines[i].substring(3);
			addFieldValue(data.text_fields, "VarianT", variant);
		}
		if (variant == "" || (variant != null && variant == data.text_variant)) {
			var colon = lines[i].indexOf(":");
			var equals = lines[i].indexOf(">");
			if (equals < 0) {
				equals = lines[i].indexOf("=");
			}
			if (colon > 0) {
				var field = lines[i].substring(0, colon);
				var value = lines[i].substring(colon + 1).trim();
				if (lines[i-1].substring(0, colon) != field) {
					if (data.text_fields[field] == null) {
						data.text_fields[field] = [];
					}
				}
				addFieldValue(data.text_fields, field, value);
			} else if (equals > 0 && (variant == data.text_variant || (variant == "" && data.text_variant == null))) {
				var from_token = lines[i].substring(0, equals);
				var to_token = lines[i].substring(equals + 1);
				normalized = normalized.replaceAll(from_token, to_token);
			}
		}
	}
	
	lines = normalized.split("\n");

	const PartLineExp1 = /^=?(?<name>.*)[\(\[](?<desc>.*)[\)\]]:(?<loVerse>\d*\*?)\-?(?<hiVerse>\d*)\@?(?<lineCode>[A-Za-z]?\.?)(?<wordNum>\d*)$/;
	const PartLineExp2 = /^=?(?<name>.*):(?<loVerse>\d*\*?)\-?(?<hiVerse>\d*)\@?(?<lineCode>[A-Za-z]?\.?)(?<wordNum>\d*)$/;
	
	data.text_title = lines[0];
	var verse = null;
	var letter = null;
	var dot = null;
	var highestUpperLetter = null;
	var highestLowerLetter = null;
	var wordnum = null;
	var part = null;
	var partname = null;
	var partname_set = {};
	var stanza = null;
	var skipping_words = false;
	for (var i = 2; i < lines.length; i++) {
		if (lines[i].length == 0) {
			continue;
		}
		if (lines[i].substring(0,3) == "---") {
			break;
		}
		var colon = lines[i].indexOf(":");
		if ((lines[i-1].length == 0 || lines[i].charAt(0) == "=") && colon > 0) {
			var match = lines[i].match(PartLineExp1);
			if (match == null) {
				match = lines[i].match(PartLineExp2);
			}
			if (match != null) {
				// Part label
				var lowercase = lines[i].toLowerCase();
				if (lowercase.substring(0,5) == "verse" || isDigit(lines[i].charAt(0))) {
					partname = "Verses";
				} else if (lines[i].charAt(0) != "=") {
					partname = match.groups.name.trim();
				}
				stanza = {
					partname: partname,
					clef: 0,
					verseNos: [], 
					map:{}
				};
				data.stanzas.push(stanza);
				if (match.groups.desc != null) {
					if (lines[i].charAt(0) == "=") {
						stanza.section = match.groups.desc;
						stanza.useTable = (lines[i].charAt(1) == "[");
					} else {
						stanza.description = match.groups.desc;
					}
				}
				if (match.groups.lineCode.length > 0) {
					if (match.groups.lineCode.toLowerCase() == match.groups.lineCode) {
						if (match.groups.lineCode.indexOf(".") > 0) {
							stanza.clef = LO_BASS;
						} else {
							stanza.clef = BASS;
						}
					} else if (match.groups.lineCode.indexOf(".") > 0) {
						stanza.clef = HI_TREBEL;
					}
				}
				var loVerse = null;
				var hiVerse = null;
				if (match.groups.loVerse.length > 0 && match.groups.loVerse != "*") {
					loVerse = parseInt(match.groups.loVerse);
					hiVerse = loVerse;
					if (match.groups.hiVerse.length > 0) {
						hiVerse = parseInt(match.groups.hiVerse);
					}
				}
				if (loVerse == null && match.groups.loVerse != "*") {
					var start = 0;
					while (start < colon) {
						if (isDigit(lines[i].charAt(start))) {
							var end = start;
							while (isDigit(lines[i].charAt(end))) {
								end++;
							}
							var num = parseInt(lines[i].substring(start,end));
							loVerse = num;
							hiVerse = num;
							if (lines[i].charAt(start-1) == "-") {
								hiVerse = num;
							}
							start = end;
						}
						start++;
					}
				}
				if (loVerse != null) {
					for (var v = loVerse; v <= hiVerse; v++) {
						stanza.verseNos.push(v);
						if (v > data.verseCount) {
							data.verseCount = v;
						}
					}
				}
				stanza.loVerse = loVerse;
				stanza.hiVerse = hiVerse;
				if (match.groups.lineCode.length > 0) {
					letter = match.groups.lineCode.charAt(0);
					dot = match.groups.lineCode.substring(1);
					if (match.groups.wordNum.length > 0) {
						wordnum = parseInt(match.groups.wordNum);
					} else {
						wordnum = 1;
					}
				} else {
					letter = null;
					for (var j = 0; j < data.stanzas.length; j++) {
						if (data.stanzas[j].partname == partname && data.stanzas[j] != stanza) {
							letter = data.stanzas[j].firstCodeLetter;
							if (stanza.clef >= 0) {
								letter = letter.toUpperCase();
							} else {
								letter = letter.toLowerCase();
							}
							dot = "";
							break;
						}
					}
					if (letter == null) {
						if (stanza.clef >= 0) {
							letter = (highestUpperLetter == null ? "A" : String.fromCharCode(highestUpperLetter.charCodeAt(0) + 1));
						} else {
							letter = (highestLowerLetter == null ? "A" : String.fromCharCode(highestLowerLetter.charCodeAt(0) + 1));
						}
					}
					dot = "";
					wordnum = 1;
				}
				stanza.firstCodeLetter = letter;
				stanza.firstCode = letter + dot + wordnum;
				skipping_words = false;
				var firstInstance = (partname_set[partname + loVerse + "-" + hiVerse] == null);
				if (firstInstance) {
					partname_set[partname + loVerse + "-" + hiVerse] = true;
				}
				if (firstInstance || stanza.description != null || lines[i].charAt(0) == "=") {
					stanza.lines = [];
				}
				continue;
			}
		}
		
		if (stanza.lines != null) {
			var text_line = encodeSpecials(lines[i]).trim().replaceAll("-|", "-").replaceAll("|", " ").replaceAll("/:","").replaceAll(":/","").replaceAll("% ","").replaceAll(" %","");
			stanza.lines.push(text_line);
		}
		var music_lines = lines[i].split("|");
		for (var n = 0; n < music_lines.length; n++) {
			var cleanLine = encodeSpecials(music_lines[n]).trim().replaceAll("-", "- ").replaceAll("=", "= ");
			cleanLine = cleanLine.replaceAll(/\/:.*:\//g, "").replaceAll("/:", " /: ").replaceAll(":/", " :/ ");
			for (var j = 0; j < cleanLine.length; j++) {
				if (cleanLine.charAt(j) == "_" && "_ ".indexOf(cleanLine.charAt(j+1)) < 0) {
					cleanLine = cleanLine.substring(0, j+1) + " " + cleanLine.substring(j+1);
				}
			}
			var words = cleanLine.split(" ");
			var underscores = 0;
			for (var j = 0; j < words.length; j++) {
				var word = words[j];
				if (word.length == 0) {
					continue;
				}
				if (word == "/:") {
					skipping_words = true;
					continue;
				}
				if (word == ":/") {
					skipping_words = false;
					continue;
				}
				var code = letter + dot + (wordnum + underscores);
				if (!skipping_words) {
					if (word == "%" || word.charAt(word.length-1) == "=") {
						var type = (word == "%" ? "rests" : "ties");
						if (data[type] == null) {
							data[type] = {};
						}
						if (data[type][code] == null) {
							data[type][code] = [];
						}
						var lo = 0;
						var hi = 0;
						if (stanza.partname == "Verses" || stanza.loVerse != null) {
							lo = stanza.loVerse;
							hi = stanza.hiVerse;
						}
						while (data[type][code].length < hi + 1) {
							data[type][code].push(stanza.loVerse == null ? null : false);
						}
						for (var v = lo; v <= hi; v++) {
							data[type][code][v] = true;
						}
						word = word.replace("=", "_").replace("%", "*");
					}
					stanza.map[code] = decodeSpecials(word, true);
					while (word.replace("_", "") != word) {
						word = word.replace("_", "");
						underscores++;
						code = letter + dot + (wordnum + underscores);
						stanza.map[code] = "";
					}
					wordnum++;
				}
			}
			wordnum = 1;
			if (stanza.clef >= 0 && (highestUpperLetter == null || letter > highestUpperLetter)) {
				highestUpperLetter = letter;
			}
			if (stanza.clef < 0 && (highestLowerLetter == null || letter > highestLowerLetter)) {
				highestLowerLetter = letter;
			}
			letter = String.fromCharCode(letter.charCodeAt(0) + 1);
		}
	}
	
	if (data.text_fields[METER] == null) {
		var meter = [];
		var named_parts = {};
		for (var a = 0; a < 26; a++) {
			meter.push(null);
		}
		for (var i = 0; i < data.stanzas.length; i++) {
			for (var a = 0; a < 26; a++) {
				if (meter[a] == null) {
					var j = (data.stanzas[i].map[String.fromCharCode(65 + a) + "1"] == null ? 32 : 0);
					if (j > 0) {
						j = 32;
					}
					for (var n = 1; n < 100; n++) {
						if (data.stanzas[i].map[String.fromCharCode(65 + a + j) + n] != null) {
							if (named_parts[data.stanzas[i].partname] == null) {
								named_parts[data.stanzas[i].partname] = {lo:a, hi:a};
							} else {
								named_parts[data.stanzas[i].partname].lo = Math.min(a, named_parts[data.stanzas[i].partname].lo);
								named_parts[data.stanzas[i].partname].hi = Math.max(a, named_parts[data.stanzas[i].partname].hi);
							}
							if (meter[a] == null || n > meter[a]) {
								meter[a] = n;
							}
						}
					}
				}
			}
		}
		var meterString = meter[0];
		for (var a = 1; a < 26 && meter[a] != null; a++) {
			var new_part = false;
			//Todo: check this
			for (key in named_parts) {
				if (named_parts[key].lo == a && a > 0) {
					new_part = true;
					break;
				}
			}
			meterString += (new_part ? " + " : ".") + meter[a];
		}
		data.text_fields[METER] = [meterString];
	}
	
	for (var i = 0; i < 2; i++) {
		var type = (i == 0 ? "ties" : "rests");
		if (data[type] != null) {
			var keys = Object.keys(data[type]);
			for (var j = 0; j < keys.length; j++) {
				var key = keys[j];
				while (data[type][key].length < data.verseCount + 1) {
					data[type][key].push(null);
				}
				for (var k = 0; k < data.stanzas.length; k++) {
					if (data.stanzas[k].map[key] != null) {
						if (data.stanzas[k].loVerse != null) {
							for (var v = data.stanzas[k].loVerse; v <= data.stanzas[k].hiVerse; v++) {
								if (data[type][key][v] == null) {
									data[type][key][v] = false;
								}
							}
						}
					}
				}
				for (var v = 1; v < data.verseCount + 1; v++) {
					if (data[type][key][v] == null) {
						data[type][key][v] = data[type][key][0];
					}
				}
				var code;
				if (key.toUpperCase() == key) {
					code = key.toLowerCase();
				} else {
					code = key.toUpperCase();
				}
				var code_found = (data[type][code] != null);
				for (var k = 0; !code_found && k < data.stanzas.length; k++) {
					code_found = (data.stanzas[k].map[code] != null);
				}
				if (!code_found) {
					data[type][code] = data[type][key];
				}
			}
		}
	}
	
	opts.versesShown = [null];
	for (var i = 1; i <= data.verseCount; i++) {
		opts.versesShown[i] = IN_SCORE;
	}
}

function get_tune(div) {
	if (div != null) {
		var svgs = div.getElementsByTagName("svg");
		for (var j = 0; j < svgs.length; j++) {
			var cls = svgs[j].className.baseVal;
			var j = cls.indexOf("tune");
			if (j >= 0) {
				return parseInt(cls.substring(j + 4));
			}
		}
	}
	return null;
}

function get_music(tune) {
	var music = null;
	if (tune != null) {
		for (var i = 0; i < abc2svg.music.length; i++) {
			if (abc2svg.music[i].n == abc2svg.abc.tunes[tune][0].fname) {
				music = abc2svg.music[i].t;
			}
		}
	}
	return music;
}

function get_music_id(music) {
	if (music == null || music == "" || music.charAt(0) != "X") {
		return null;
	}
	return parseInt(music.substring(2, music.indexOf("\n")));
}

function set_music(div, music) {
	var child = div.getElementsByTagName("div")[0];
	var tune = get_tune(div);
	if (tune != null) {
		while (child.firstChild != null) {
			child.removeChild(child.firstChild);
		}
	}
    abc2svg.set_music(child, music);
	if (div.id != "no_words_score" && div.id != "codewords_score" && div.id.indexOf("layout") < 0) {
		prepare_music(div);
	}
}

function get_first_code_for_partname(partname) {
	var codes = [];
	for (var i = 0; i < data.stanzas.length; i++) {
		if (data.stanzas[i].partname.toUpperCase() == partname.toUpperCase()) {
			codes.push(data.stanzas[i].firstCode.toUpperCase());
		}
	}
	return codes.toSorted()[0];
}

function prepare_music(div, tryno) {
	if (tryno > 200) {
		console.log("prepare_music failed");
		return;
	}
	var tune = get_tune(div);
	var music = get_music(tune);
	if (tune == null || get_music_id(music) == 1) {
		log_try("prepare_music", tryno);
		setTimeout(prepare_music, 5, div, (tryno == null ? 1 : tryno + 1));
		return;
	}
	
	// Create index to address the svg text elements of the lyrics by note codeword
	var maps = [];
	var texts = div.getElementsByTagName("text");
    for (var i = 0; i < texts.length; i++) {
		var s = texts[i].textContent;
		var j = s.indexOf("\u200B");
		var k = s.indexOf("\u200C");
		if (j >= 0 && k >= 0) {
			j = Math.min(j, k);
		}
		if (j >= 0) {
			/*
			var chars1 = [s.codePointAt(), s.codePointAt(j + 1), s.codePointAt(j + 2), s.codePointAt(j + 3), s.codePointAt(j + 4), s.codePointAt(j + 5)];
			var chars2 = [s.codePointAt(), s.codePointAt(j + 1) - 0xFE00, s.codePointAt(j + 2), s.codePointAt(j + 3) - 0xFE00, s.codePointAt(j + 4), s.codePointAt(j + 5) - 0xFE00];
			if (chars2[4] != 0x200B) {
				console.log(chars1);
				console.log(chars2);
			}
			*/
			var verse = s.codePointAt(j + 1) - 0xFE00;
			while (maps.length <= verse) {
				maps.push(null);
			}
			if (maps[verse] == null) {
				maps[verse] = {};
			}
			var n = (s.codePointAt(j + 2) - 0x200B) * 16 + ((s.codePointAt(j + 3) - 0xFE00));
			if ((s.codePointAt(j) & 1) == 0) {
				n += 32;
			}
			var code = String.fromCharCode(65 + n);
			if (s.codePointAt(j + 6) == 0x200B) {
				code += ".";
			}
			var m = (s.codePointAt(j + 4) - 0x200B) * 16 + ((s.codePointAt(j + 5) - 0xFE00));
			code += m;
			maps[verse][code] = texts[i];
		}
	}
	if (abc2svg.words == null) {
		abc2svg.words = [];
	}
	while (abc2svg.words.length <= tune) {
		abc2svg.words.push(null);
	}
	abc2svg.words[tune] = maps;
	//console.log(maps);
	
	// Fill in missing words by repeating the previous word
	for (var i = 0; i < data.stanzas.length; i++) {
		var keys = Object.keys(data.stanzas[i].map);
		for (var j = 0; j < keys.length; j++) {
			var key = keys[j];
			var lo = 0;
			var hi = 0
			if (data.stanzas[i].loVerse != null) {
				lo = data.stanzas[i].loVerse;
				hi = data.stanzas[i].hiVerse;
			}
			for (var v = lo; v <= hi; v++) {
				if (maps[v] != null) {
					var word = maps[v][key];
					if (word == null) {
						var letter = key.charAt(0);
						var dot = (key.charAt(1) == "." ? "." : "");
						var n = parseInt(key.substring(1 + dot.length));
						while (word == null && n > 1) {
							n--;
							word = maps[v][letter + dot + n];
						}
						while ((letter + dot + n) != key) {
							n++;
							maps[v][letter + dot + n] = word;
						}
					}
				}
			}
		}
	}
	//console.log(maps);
	
	// Fix reprise line, if any
	if (music.indexOf("0.~") > 0) {
		var part_instruction = music.indexOf("[P:");
		if (part_instruction > 0) {
			var end = music.indexOf("]", part_instruction);
			var partname = music.substring(part_instruction + 3, end);
			for (var i = 0; i < texts.length; i++) {
				var partname_text = texts[i];
				if (partname_text.textContent == partname) {
					partname_text.textContent = "";
					var code = get_first_code_for_partname(partname);
					var word_text = maps[0][code];
					/*
					var next_word_text = word_text;
					var next_code = code;
					while (next_word_text == word_text) {
						next_code = next_code.charAt(0) + (parseInt(next_code.substring(1)) + 1);
						next_word_text = maps[0][next_code];
						if (next_word_text == null) {
							log("y");
						}
					}
					var word_x = parseInt(word_text.getAttribute("x"));
					var width = parseInt(next_word_text.getAttribute("x")) - word_x;*/
					var s = word_text.textContent;
					//var word = s.substring(s.indexOf("0."));
					//var letter_width = width / word.length;
					if (code == "A1") {
						var new_text = document.createElementNS("http://www.w3.org/2000/svg", "text");
						new_text.setAttribute("class", word_text.getAttribute("class"));
						//new_text.setAttribute("x", word_x - letter_width * (partname.length));
						new_text.setAttribute("x", "25");
						new_text.setAttribute("y", word_text.getAttribute("y"));
						var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
						tspan.setAttribute("font-style", "italic");
						tspan.appendChild(document.createTextNode(partname.charAt(0) + partname.substring(1).toLowerCase() + ":"))
						new_text.appendChild(tspan);
						word_text.parentNode.appendChild(new_text);
					}
					word_text.textContent = s.replace("0. ", "    ");
					for (var j = 0; j < data.stanzas.length; j++) {
						if (data.stanzas[j].partname.toUpperCase() == partname.toUpperCase()) {
							for (code in data.stanzas[j].map) {
								word_text = maps[0][code];
								if (word_text != null) {
									var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
									tspan.setAttribute("font-style", "italic");
									tspan.textContent = word_text.textContent;
									word_text.textContent = "";
									word_text.appendChild(tspan);
								}
							}
						}
					}
/*					
					for (var e = word_text; e != null; e = e.nextElementSibling) {
						if (e.tagName == "text") {
							tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
							tspan.setAttribute("font-style", "italic");
							tspan.textContent = e.textContent;
							e.textContent = "";
							e.appendChild(tspan);
						}
					}
					*/
					break;
				}
			}
		}
	}
	
	// Create index to address the svg rect elements of the notes by symbol index in the parsed tune data 
	var music = null;
	for (var i = 0; i < abc2svg.music.length; i++) {
		if (abc2svg.music[i].n == abc2svg.abc.tunes[tune][0].fname) {
			music = abc2svg.music[i].t;
		}
	}
	
	var voice_starts = [];
	var max_times = [];
	var start = i;
	for (var i = music.indexOf("\nV:", start); i > 0; i = music.indexOf("\nV:", start)) {
		var voice = parseInt(music.substring(i+3, i+5));
		while (voice_starts.length <= voice) {
			voice_starts.push(null);
			max_times.push(0);
		}
		voice_starts[voice] = i;
		start = i + 5;
	}
	
	var rect_map = {};
	for (var i = 0; i < data.voices.length; i++) {
		var v = data.voices[i];
		var next_v = ".";
		if (i + 1 < data.voices.length) {
			next_v = data.voices[i + 1];
		}
		var letter = (data.voice_clef[v] >= 0 ? "A" : "a");
		var dot = (data.voice_clef[v] == 1 || data.voice_clef[v] == -2 ? "." : "");
		var n = 1;
		var code = letter + dot + n;
		var start = data.raw_music.indexOf("\nV:" + v);
		if (start > 0) {
			start = data.raw_music.indexOf("\nw:" + code, start);
			if (start > 0) {
				start += 3 + code.length;
			}
		}
		var end = (data.raw_music + "\nV:" + next_v).indexOf("\nV:" + next_v, start);
		if (start > 0) {
			for (var sym = abc2svg.abc.tunes[tune][0]; sym.ts_next != null; sym = sym.ts_next) {
				var voice = 0;
				while (voice < voice_starts.length && (voice_starts[voice] == null || voice_starts[voice] < sym.istart)) {
					voice++;
				}
				voice--;
				if (voice == v) {
					if (sym.type == abc2svg.C.NOTE) {
						//console.log(sym.istart + " " + sym.time + " " + code);
						code = letter + dot + n;
						//if (sym.istart == 0 || code == "B3") {
						//	console.log(code);
						//}
						var next = -1;
						if (sym.time < max_times[voice] + .0000001) {
							next = 0;
						} else if (data.raw_music.charAt(start) == "_") {
							next = start+1;
							start = next;
						}
						while (next < 0) {
							n++;
							if (n > 100) {
								letter = String.fromCharCode(letter.charCodeAt(0) + 1);
								if (letter.toUpperCase() == letter.toLowerCase()) {
									next = end + 1;
									break;
								}
								n = 1;
							}
							code = letter + dot + n;
							next = data.raw_music.indexOf(code, start);
							if (next > end) {
								continue;
							}
							if (next >= start) {
								start = next + code.length;
							}
						}
						if (next > end) {
							break;
						}
						if (next >= 0) {
							var rects = div.getElementsByClassName("abcr _" + sym.istart + "_");
							if (rects.length > 0) {
								rect_map["abcr" + sym.istart] = code;
							}
						}
						max_times[voice] = Math.max(max_times[voice], sym.time);
					} else if (sym.type == abc2svg.C.REST) {
						max_times[voice] = Math.max(max_times[voice], sym.dur);
					}
				}
			}
		}
	}
	if (abc2svg.codes == null) {
		abc2svg.codes = [];
	}
	while (abc2svg.codes.length <= tune) {
		abc2svg.codes.push(null);
	}
	abc2svg.codes[tune] = rect_map;
	//console.log(rect_map);
}

function addSpan(e, text, linebreak) {
	var span = document.createElement("span");
	span.appendChild(document.createTextNode(text));
	e.appendChild(span);
	if (linebreak) {
		e.appendChild(document.createElement("br"));
	}
}

function toggleProperty() {
	if (window.event.target.textContent == PLUS) {
		var td1 = window.event.target;
		var tr = td1.parentNode;
		var th = tr.getElementsByTagName("th")[0];
		var td2 = tr.getElementsByTagName("td")[1];
		var div = td2.getElementsByTagName("div")[0];
		var new_tr_2 = document.createElement("tr");
		var new_td_2 = document.createElement("td");
		new_td_2.setAttribute("colspan", "3");
		new_td_2.appendChild(document.createTextNode(div.textContent));
		new_tr_2.appendChild(new_td_2);
		var insertPt = tr.nextSibling;
		tr.parentNode.insertBefore(new_tr_2, insertPt);
		var new_tr_1 = document.createElement("tr");
		var new_td_1 = document.createElement("td");
		new_td_1.setAttribute("colspan", "3");
		new_tr_1.style.display = NONE;
		new_tr_1.appendChild(new_td_1);
		tr.parentNode.insertBefore(new_tr_1, new_tr_2);
		var field;
		if (th.title == null || th.title.length == 0) {
			field = th.textContent;
		} else {
			field = th.title + ":";
		}
		while (tr.firstChild != null) {
			tr.removeChild(tr.firstChild);
		}
		var new_th = document.createElement("th");
		new_th.setAttribute("colspan", "3");
		new_th.appendChild(document.createTextNode(field));
		var span = document.createElement("span");
		span.className = "field_expander";
		span.innerHTML = NDASH;
		span.setAttribute("onclick", "toggleProperty()");
		new_th.appendChild(span);
		tr.appendChild(new_th);
	} else {
		var e = window.event.target.parentNode;
		while (e.nodeName != "TR") {
			e = e.parentNode;
		}
		var tr = e;
		var th = tr.getElementsByTagName("th")[0];
		var table = tr.parentNode;
		var field = th.textContent;
		var colon = field.indexOf(":");
		field = field.substring(0, colon);
		var trs = table.getElementsByTagName("tr");
		var row = 0;
		while (trs[row] != tr) {
			row++;
		}
		var insertPt = null;
		if (trs.length > row + 3) {
			insertPt = trs[row + 3];
		}
		addMetadataRow(tr.parentNode, field, trs[row + 2].textContent);
		for (var i = row + 2; i >= row; i--) {
			table.removeChild(trs[i]);
		}
		var new_tr = table.lastChild;
		if (insertPt != null) {
			table.removeChild(new_tr);
			table.insertBefore(new_tr, insertPt);
		}
	}
}

function changeText() {
	resetMusic();
	for (var i = 1; i <= data.verseCount; i++) {
		document.getElementById("v" + i).style.display = NONE;
	}
	var tr = window.event.target.parentNode.parentNode;
	var td = tr.getElementsByTagName("td")[1];
	var div = td.getElementsByTagName("div")[0];
	var selection = div.textContent;
	if (selection.indexOf("(Default)") >= 0) {
		data.text_variant = "";
		parse_text_data();
		load_music_data();
	} else if (data.raw_text.indexOf("---" + selection) > 0) {
		data.text_variant = selection;
		parse_text_data();
		load_music_data();
	} else {
		var open_p = selection.indexOf("(");
		if (open_p > 0) {
			data.textID = selection.substring(0, open_p).trim();
			data.text_variant = selection.substring(open_p + 1).replace(")", "").trim();
		} else {
			data.textID = selection;
			data.text_variant = "";
		}
		load_text_data();
	}
}

function changeMusic() {
	resetMusic();
	var tr = window.event.target.parentNode.parentNode;
	var td = tr.getElementsByTagName("td")[1];
	var div = td.getElementsByTagName("div")[0];
	data.musicID = div.textContent;
	load_music_data();
}

function changeVerseShown() {
	var table = document.getElementById("score_verses_table");
	var selects = table.getElementsByTagName("select");
	for (var i = 0; i < selects.length; i++) {
		if (selects[i] == window.event.target) {
			opts.versesShown[i+1] = selects[i].selectedIndex;
		}
	}
	var span = document.getElementById("default_performance_plan");
	fillPerformancePlan();
	opts.scoreChanged = true;
}

function changeWordSpacing() {
	opts.wordSpacing = document.getElementById("word_spacing").value;
	opts.scoreChanged = true;
}

function changePerformancePlan() {
	if (!!document.getElementById('pp_radio_default').checked) {
		opts.performancePlan = null;
	} else {
		opts.performancePlan = document.getElementById("pp_custom_span").textContent;
	}
	fillPerformancePlan();
}

function fillPerformancePlan() {
	var span = document.getElementById("pp_default_span");
	if (data.text_fields["Road Map"] != null) {
		span.textContent = data.text_fields["Road Map"][0];
	} else {
		span.textContent = calc_plan();
	}
	if (opts.performancePlan != null) {
		document.getElementById("pp_custom_span").textContent = opts.performancePlan;
	}
}

function get_custom_pp() {
	var new_pp = window.prompt("Enter a new performance plan", opts.performancePlan);
	document.getElementById("pp_custom_span").textContent = new_pp;
	changePerformancePlan();
}

function addMetadataRow(table, field, value) {
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	th.appendChild(document.createTextNode(field.replace(" ", "\u00A0").substring(0, FIELD_NAME_LIMIT) + (field.length > FIELD_NAME_LIMIT ? "..." : ":")));
	if (field.length > FIELD_NAME_LIMIT) {
		th.title = field;
	}
	tr.appendChild(th);
	var td1 = document.createElement("td");
	if (field.length > FIELD_NAME_LIMIT || value.length > FIELD_VALUE_LIMIT) {
		td1.className = "field_expander";
		td1.setAttribute("onclick", "toggleProperty()");
		td1.appendChild(document.createTextNode("+"));
	}
	tr.appendChild(td1);
	var td2 = document.createElement("td");
	var div = document.createElement("div");
	if (value.length > FIELD_VALUE_LIMIT) {
		div.title = value.substring(0,80) + (value.length > 80 ? "..." : "");
	}
	div.appendChild(document.createTextNode(value));
	td2.appendChild(div);
	tr.appendChild(td2);
	table.appendChild(tr);
}

function addRadioRow(table, name, value, checked, onclick) {
	var tr = document.createElement("tr");
	var td1 = document.createElement("td");
	var input = document.createElement("input");
	input.setAttribute("name", name);
	input.setAttribute("type", "radio");
	if (checked) {
		input.setAttribute("checked", "checked");
	}
	input.setAttribute("onclick", onclick);
	td1.appendChild(input);
	tr.appendChild(td1);
	var td2 = document.createElement("td");
	var div = document.createElement("div");
	if (value.length > RADIO_VALUE_LIMIT) {
		div.title = value;
	}
	div.appendChild(document.createTextNode(value));
	td2.appendChild(div);
	tr.appendChild(td2);
	table.appendChild(tr);
}

function parse_music_data() {
	data.verse_labels = [""];
	var verse_label = 1;
	for (var v = 1; v <= data.verseCount; v++) {
		data.verse_labels.push(verse_label);
		if (opts.versesShown[v] != REMOVE_VERSE) {
			verse_label++;
		}
	}
	
	data.templates = [];
	data.parsed_words = [];

    // Order stanzas by clef and verse.  Verse 0 is reprise.  Verse verseCount+1 is for lines without a verse number until they are placed
	var stanzas_by_seq_clef_verse = [];
	for (var seq = 0; seq < data.verseCount + 2; seq++) {
		data.parsed_words.push([]);
		stanzas_by_seq_clef_verse.push([[],[],[],[]]);
		for (var c = 1; c >= -2; c--) {
			for (var v = 0; v <= data.verseCount + 1; v++) {
				stanzas_by_seq_clef_verse[seq][1-c].push([]);
			}
		}
	}

	// Start with parts other than "Verses"
	for (var seq = 0; seq < data.verseCount + 2; seq++) {
		for (var i = 0; i < data.stanzas.length; i++) {
			if (data.stanzas[i].partname != "Verses") {
				for (var c = 1; c >= -2; c--) {
					if (data.stanzas[i].clef == c) {
						var v = data.stanzas[i].loVerse;
						if (v == null) {
							stanzas_by_seq_clef_verse[seq][1-c][data.verseCount + 1].push(i);
						//} else if (seq > 0 || opts.versesShown[v] == IN_SCORE) {
						} else if (seq == 0 || opts.versesShown[v] == IN_SCORE) {
							stanzas_by_seq_clef_verse[seq][1-c][v].push(i);
						}
					}
				}
			}
		}
	}
	
	// Place lines without a verse number in seq 0
	for (var c = 1; c >= -2; c--) {
		var start = 1;
		while (start <= data.verseCount && stanzas_by_seq_clef_verse[0][1-c][start].length > 0) {
			start++;
		}
		var end = start;
		while (end <= data.verseCount && stanzas_by_seq_clef_verse[0][1-c][end + 1].length == 0) {
			end++;
		}
		var mid = [];
		for (var i = start; i <= end; i++) {
			if (opts.versesShown[i] == IN_SCORE) {
				mid.push(i);
			}
		}
		var v = mid[Math.floor((mid.length - 1) / 2)];
		for (var i = 0; i < stanzas_by_seq_clef_verse[0][1-c][data.verseCount + 1].length; i++) {
			stanzas_by_seq_clef_verse[0][1-c][v].push(stanzas_by_seq_clef_verse[0][1-c][data.verseCount + 1][i]);
		}
		stanzas_by_seq_clef_verse[0][1-c][data.verseCount + 1] = null;
	}

	// Place lines without a verse number for other presentation seqs
	for (var seq = 1; seq < data.verseCount + 2; seq++) {
		for (var c = 1; c >= -2; c--) {
			for (var i = 0; i < stanzas_by_seq_clef_verse[seq][1-c][data.verseCount + 1].length; i++) {
				stanzas_by_seq_clef_verse[seq][1-c][seq - 1].push(stanzas_by_seq_clef_verse[seq][1-c][data.verseCount + 1][i]);
			}
		}
	}

	// Add "Verses" parts
	for (var seq = 0; seq < data.verseCount + 2; seq++) {
		for (var i = 0; i < data.stanzas.length; i++) {
			if (data.stanzas[i].partname == "Verses") {
				for (var c = 1; c >= -2; c--) {
					if (data.stanzas[i].clef == c) {
						var v = data.stanzas[i].loVerse;
						console.assert(v != null);
						if (seq > 0 || opts.versesShown[v] == IN_SCORE) {
							stanzas_by_seq_clef_verse[seq][1-c][v].push(i);
						}
					}
				}
			}
		}
	}
	
	// Order by clef and line
	var stanzas_by_seq_clef_line = [];
	for (var seq = 0; seq < data.verseCount + 2; seq++) {
		stanzas_by_seq_clef_line.push([[],[],[],[]]);
		for (var c = 1; c >= -2; c--) {
			for (var v = 0; v <= data.verseCount; v++) {
				var vv = (v + 1) % (data.verseCount + 1);
				if (seq == 0 || seq == vv + 1) {
					if (stanzas_by_seq_clef_verse[seq][1-c][vv].length > 0) {
						var lines = [];
						for (var i = 0; i < stanzas_by_seq_clef_verse[seq][1-c][vv].length; i++) {
							lines.push(stanzas_by_seq_clef_verse[seq][1-c][vv][i]);
						}
						stanzas_by_seq_clef_line[seq][1-c].push(lines);
					}
				}
			}
		}
	}
	
	var first_code_for_verses = get_first_code_for_partname("Verses");
	
	var lines = data.raw_music.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
	for (var i = 0; i < lines.length; i++) {
	  if (lines[i].substr(0,2) == "w:") {
		var template = lines[i] + "\n";
		for (var j = i + 1; j < lines.length && lines[j].substr(0,2) == "+:"; j++) {
			template += lines[j] + "\n";
		}
		data.templates.push(template);
		var codes = normalizeSpace(template.substr(2).replaceAll("\n+:", " ").replaceAll("_", " ")).split(" ");
		var c = 0;
		for (var j = 0; j < codes.length; j++) {
			if (codes[j].toUpperCase() != codes[j].toLowerCase()) {
				if (codes[j] == codes[j].toLowerCase()) {
					c = (codes.indexOf(".") < 0 ? 2 : 3);
				} else if (codes.indexOf(".") < 0) {
					c = 1;
				}
				break;
			}
		}
		for (var seq = 0; seq < data.verseCount + 2; seq++) {
			data.parsed_words[seq].push("");
			var stanzas = stanzas_by_seq_clef_line[seq][c];
			for (var j = 0; j < stanzas.length; j++) {
				var new_words = template;
				for (var k = 0; k < stanzas[j].length; k++) {
					var stanza_data = data.stanzas[stanzas[j][k]];
					var v = stanza_data.loVerse;
					if (v == null) {
						v = 0;
					}
					for (var code_no = codes.length - 1; code_no >= 0; code_no--) {
						var word = stanza_data.map[codes[code_no]];
						if (word == "") {
							new_words = new_words.replace(" " + codes[code_no], "");
							new_words = new_words.replace(codes[code_no] + " ", "");
						} else if (word != null) {
							var prefix  = "";
							var n = codes[code_no].charCodeAt(0) - 65;
							var lower = 0;
							if (n >=32) {
								n -= 32;
								lower = 1;
							}
							var dotted = 0;
							if (codes[code_no].charCodeAt(1) == ".") {
								dotted = 1;
							}
							var m = parseInt(codes[code_no].substring(1 + dotted));
							prefix += "&#x" + (0x200B + lower).toString(16) + ";&#x" + (0xFE00 + v).toString(16) + ";";
							prefix += "&#x" + (0x200B + (n & 16) / 16).toString(16) + ";&#x" + (0xFE00 + (n & 15)).toString(16) + ";";
							prefix += "&#x" + (0x200B + (m & 16) / 16).toString(16) + ";&#x" + (0xFE00 + (m & 15)).toString(16) + ";";
							prefix += (dotted ? "&#x200B;" : "");
							//if (v > 0 && n == 0 && m == 1) {
							//if (n == 0 && m == 1) {
							if (codes[code_no] == first_code_for_verses) {
								//prefix += (v==0 ? "0" : data.verse_labels[v]) + ".~";
								prefix = (v==0 ? "0" : data.verse_labels[v]) + ".~" + prefix;
							}
							if (word == "*") {
								word = "";
							}
							new_words = new_words.replace(codes[code_no], prefix + word);
						}
					}
				}
				for (var code_no = codes.length - 1; code_no >= 0; code_no--) {
					new_words = new_words.replace(codes[code_no], "*");
				}
				var old_len = -1;
				while (old_len != new_words.length) {
					old_len = new_words.length;
					new_words = new_words.replaceAll("*_", "* *");
				}
				data.parsed_words[seq][data.parsed_words[seq].length - 1] += new_words;
			}
	    }
	  }
	}

	
	console.assert(lines[0].substr(0,2) == "X:", "Music does not start with an X: field");
	lines[0] = "X:1\nT:" + data.text_title;
	
	var new_music = "";
	var voice = 0;
	data.voices = [];
	data.voice_clef = [];
	var titleno = 0;
	var fields = {};
	if (data.music_fields != null && data.music_fields.Variant != null) {
		for (var i = 0; i < data.music_fields.Variant.length; i++) {
			if (data.music_fields.Variant[i] != data.musicID) {
				if (fields.Variant == null) {
					fields.Variant = [];
				}
				fields.Variant.push(data.music_fields.Variant[i]);
			}
		}
	}
	for (var i = 0; i < lines.length; i++) {
	  if (lines[i].substr(0,2) == "T:") {
		addFieldValue(fields, TITLE, lines[i].substr(2).trim());
		if (lines[i].match(/[a-z]/)) {
			lines[i] = "";
		}
	  } else if (lines[i].substr(0,2) == "C:") {
		  addFieldValue(fields, COMPOSER, lines[i].substr(2).trim());
		  lines[i] = "";
	  } else if (":N:Z:".indexOf(lines[i].substr(0,2)) > 0) {
		  var field = (lines[i].charAt(0) == "N" ? "Note" : "Transcription");
		  var colon = lines[i].indexOf(":", 2);
		  var value;
		  if (colon > 2) {
			  field = lines[i].substring(2, colon);
			  value = lines[i].substring(colon + 1).trim();
		  } else {
			  value = lines[i].substring(2).trim();
		  }
		  var found = false;
		  if (fields[field] != null) {
			  for (var j = 0; j <= fields[field].length && !found; j++) {
				  found = (fields[field][j] == value);
			  }
		  }
		  if (!found) {
			addFieldValue(fields, field, value);
		  }
		  lines[i] = "";
	  } else if (lines[i].substr(0,6) == "Q:1/4=") {
		  tempo = parseInt(lines[i].substr(6));
		  fields[TEMPO] = [tempo];
	  } else if (lines[i].substr(0,2) == "K:") {
		  fields[KEYSIG] = [lines[i].substr(2)];
	  } else if (lines[i].substr(0,9) == "I:score (") {
		var j = lines[i].indexOf(")");
		var trebel = normalizeSpace(lines[i].substring(9, j));
		var bass = normalizeSpace(lines[i].substring(j + 1).replace("(","").replace(")",""));
		var parts = trebel.split(" ");
		for (var k = 0; k < parts.length; k++) {
			var n = parseInt(parts[k]);
			while (data.voice_clef.length <= n) {
				data.voice_clef.push(null);
			}
			if (k < 2) {
				data.voice_clef[n] = k;
			}
		}
		var parts = bass.split(" ");
		for (var k = 0; k < parts.length; k++) {
			var n = parseInt(parts[k]);
			while (data.voice_clef.length <= n) {
				data.voice_clef.push(null);
			}
			if (k < 2) {
				data.voice_clef[n] = 0-k-1;
			}
		}
	  } else if (lines[i].substr(0,2) == "V:") {
		  var clef = (voice == 0 ? 0 : -1);
		  voice = parseInt(lines[i].substr(2));
		  if (data.voice_clef.length < voice) {
			while (data.voice_clef.length <= voice) {
			  data.voice_clef.push(null);
			}
			data.voice_clef[voice] = clef;
		  }
		  data.voices.push(voice);
	      if (voice == 1) {
		    lines[i] = "%%pagewidth 22cm\n%%leftmargin 10px\n%%rightmargin 10px\n" + lines[i];
		  }
	  }
	}
	data.music_fields = fields;
	
	if (data.text_fields[AUTHOR] != null && data.music_fields[COMPOSER] != null && getFieldValues(data.text_fields,AUTHOR).replace(/\(\),;.\w\d/, "") == getFieldValues(data.music_fields,COMPOSER).replace(/\(\),;.\w\d/, "") ) {
		lines[0] += "\nC:" + data.text_fields[AUTHOR];
	} else {
		if (data.text_fields[AUTHOR] != null) {
			lines[0] += "\nC:Text: " + getFieldValues(data.text_fields, AUTHOR);
		}
		if (data.music_fields[COMPOSER] != null) {
			lines[0] += "\nC:Music: " + getFieldValues(data.music_fields, COMPOSER);
		}
	}
	
	for (var i = 0; i < lines.length; i++) {
	  if (lines[i].length > 0) {
	    new_music += lines[i] + "\n";
	  }
	}
	
	new_music = new_music.replaceAll("!sp!y", "");
	new_music = new_music.replaceAll(/\"Refrain\"\s+y/ig, "");
	//new_music = new_music.replaceAll("||", "|");
	/*
	var len = 0;
	var barno = 1001;
	while (new_music.length != len) {
		len = new_music.length;
		new_music = new_music.replace("!sp!y &", "&");
		new_music = new_music.replace("!sp!y |", "|");
		new_music = new_music.replace("!sp!y", "[I:tieheight 1." + barno + "] !sp2!y");
		barno++;
	}
	//console.log(new_music);
	*/
	//if (opts.wordsShown == NONE) {
	//	new_music = replace_words(new_music, null, "normal");
	//} else if (opts.wordsShown == HYMN) {
	//	new_music = replace_words(new_music, data.parsed_words[0], opts.wordSpacing);
	//}

	data.processed_music = null;
	data.music_with_split_points = null;
	data.preprocessed_music = new_music;
}

function addSpaces(words, spacing) {
	if (spacing == "normal") {
		return words.replaceAll("~ ", "&ensp; ");
	} else if (spacing == "less") {
		return words.replaceAll("~ ", " ");
	} else if (spacing == "padded") {
		var parts = words.split(" ");
		var new_words = "";
		for (var i = 0; i < parts.length; i++) {
			if (i > 0) {
				new_words += " ";
			}
			new_words += parts[i]
			if ("-_*".indexOf(parts[i].charAt(parts[i].length - 1)) < 0) {
				new_words += "\u2009\u2009\u2009\u2009";
			}
		}
		return new_words;
	} else if (spacing == "present") {
		var parts = words.split(" ");
		var new_words = parts[0];
		for (var i = 1; i < parts.length; i++) {
			if (parts[i] == "*") {
				new_words += " *";
			} else {
				new_words += " \u2002";
				var append = true;
				for (var j = 0; append && j < parts[i].length; j++) {
					if ("-_".indexOf(parts[i].charAt(j)) >= 0) {
						new_words += parts[i].substring(0, j) + "\u2002" + parts[i].substring(j);
						append = false;
					}
				}
				if (append) {
					new_words += parts[i] + "\u2003";
				}
			}
		}
		return new_words;
	} else {
		return ("&ensp;" + words.substr(words.substr(0,1) == ' ' ? 1 : 0)).replaceAll(" ", " &ensp;").replaceAll("&ensp;*", "*");
	}
}

function replace_words(music, new_words, wordSpacing) {
	var lines = music.split("\n");
	var new_music = "";
	var word_line = false;
	var word_line_no = 0;
	for (var i = 0; i < lines.length; i++) {
		var continuation = (lines[i].substring(0,2) == "+:");
		if (lines[i].substring(0,2) == "w:" && !continuation) {
			if (new_words != null) {
				var word_lines = new_words[word_line_no].split("\n");
				for (var j = 0; j < word_lines.length - 1; j++) {
					new_music += word_lines[j].substring(0,2) + addSpaces(word_lines[j].substring(2), wordSpacing) + "\n";
				}
			}
			if (!word_line && new_words == "") {
				new_music += "w:\u200B\n";
			}
			word_line = true;
			word_line_no++;
		} else if (continuation && word_line) {
			// do nothing
		} else {
			new_music += lines[i] + "\n";
			word_line = false;
		}
	}
	return new_music;
}

function update_music_seqno(music) {
	abc_seq++;
	//return music.replace(/X:\d+ +/, "X:" + (abc_seq + "    ").substring(0, 4));
	return music.replace(/X:\d+/, "X:" + abc_seq);
}

function displayMusic(tryno) {
	if (tryno > 200) {
		console.log("displayMusic failed");
		return;
	}
    if (abc2svg.music == null) {
		// dom_loaded (from abcweb-1) not complete
		log_try("displayMusic", tryno);
		setTimeout(displayMusic, 5, (tryno == null ? 1 : tryno + 1));
		return;
    }
	fillMusicScores();
	var spacings = ["normal", "padded"];
	for (var i = 0; i < spacings.length; i++) {
		fillBarAlignedMusic(spacings[i]);
		fillLayoutMusic(spacings[i]);
		fillAutoAlignedMusic(spacings[i]);
	}
	fillEndWords();
	selectBestLayout();
	fillPresentationMusic();
}	

function fillMusicScores(tryno) {
	if (tryno > 200) {
		console.log("fillMusicScores failed");
		return;
	}
	var div1 = document.getElementById("no_words_score");
	var tune1 = get_tune(div1);
	var div2 = document.getElementById("codewords_score");
	var tune2 = get_tune(div2);
	if (tune1 == null || tune2 == null || data.preprocessed_music == null) {
		// dom_loaded or parse_music_data not complete
		log_try("fillMusicScores", tryno);
		setTimeout(fillMusicScores, 5, (tryno == null ? 1 : tryno + 1));
		return;
    }
	var new_music = data.preprocessed_music;
	set_music(div2, update_music_seqno(new_music));

	new_music = replace_words(new_music, null, "normal");
	set_music(div1, update_music_seqno(new_music));
}

function fillBarAlignedMusic(spacing, tryno) {
	if (tryno > 200) {
		console.log("fillBarAlignedMusic failed");
		return;
	}
	var div = document.getElementById("codewords_score");
	var tune = get_tune(div);
	var music = get_music(tune);
	if (tune == null || get_music_id(music) == 1) {
		// set_music in fillMusicScores not complete
		log_try("fillBarAlignedMusic", tryno);
		setTimeout(fillBarAlignedMusic, 5, spacing, (tryno == null ? 1 : tryno + 1));
		return;
    }

	prepare_music(div);
	
	var codes = {};
	for (var i = 0; i < data.stanzas.length; i++) {
		if (data.stanzas[i].partname != "_") {
			if (codes[data.stanzas[i].partname] == null) {
				codes[data.stanzas[i].partname] = [data.stanzas[i].firstCode.toUpperCase()];
			} else {
				codes[data.stanzas[i].partname].push(data.stanzas[i].firstCode.toUpperCase());
			}
		}
	}
	
	var unique_partnames = Object.keys(codes);
	var insert_points = [];
	var abcr_names = Object.keys(abc2svg.codes[tune]);
	for (i = 0; i < unique_partnames.length; i++) {
		var code = codes[unique_partnames[i]].toSorted()[0];
		var pos = 99999;
		for (var j = 0; j < abcr_names.length; j++) {
			if (abc2svg.codes[tune][abcr_names[j]] == code) {
				var n = parseInt(abcr_names[j].substring(4));
				pos = Math.min(pos, n);
			}
		}
		if (pos < 99999) {
			insert_points.push(pos);
		}
	}
	
	insert_points.sort((a,b) => a[0] - b[0]);
	
	var new_music = "";
	var start = 0;
	for (i = 0; i < unique_partnames.length; i++) {
		var code = codes[unique_partnames[i]].toSorted()[0];
		var partname = unique_partnames[i].toUpperCase();
		if (code.toUpperCase() == "A1" && partname == "VERSES") {
			partname = "VERSE nn";
		}
		new_music += music.substring(start, insert_points[i]) + "[P:" + partname + "]";
		start = insert_points[i];
	}
	new_music += music.substring(start);
	
	data.presentation_music = new_music;
	
	new_music = new_music.replace("[P:VERSE nn]", "");

	//var new_music = data.preprocessed_music;
	if (opts.wordsShown == NONE) {
		new_music = replace_words(new_music, null, spacing);
	} else if (opts.wordsShown == HYMN) {
		new_music = replace_words(new_music, data.parsed_words[0], spacing);
	}
	var div = document.getElementById(spacing + "_bar_score");
	set_music(div, update_music_seqno(new_music));
}

function fillLayoutMusic(spacing, tryno) {
	if (tryno > 200) {
		console.log("fillLayoutMusic failed");
		return;
	}
	var div = document.getElementById(spacing + "_bar_score");
	var tune = get_tune(div);
	var music = get_music(tune);
	if (tune == null || get_music_id(music) == 1) {
		// set_music in fillBarAlignedMusic not complete 
		log_try("fillLayoutMusic", tryno);
		setTimeout(fillLayoutMusic, 5, spacing, (tryno == null ? 1 : tryno + 1));
		return;
	}

	abc2svg.init_tune(tune);
	
	var voice_starts = [];
	var split_points = [];
	var current_start = [];
	var current_end = [];
	var in_tie = [];
	var max_times = [];
	var start = i;
	var voice = 0;
	for (var i = music.indexOf("\nV:", start); i > 0; i = music.indexOf("\nV:", start)) {
		start = i + 5;
		voice_starts.push(start);
		current_start.push(0);
		current_end.push(0);
		in_tie.push(false);
		max_times.push(0);
	}
	
	for (var sym = abc2svg.abc.tunes[tune][0]; sym.ts_next != null; sym = sym.ts_next) {
		var voice = 0;
		while (voice < voice_starts.length && (voice_starts[voice] == null || voice_starts[voice] < sym.istart)) {
			voice++;
		}
		voice--;
		if (sym.type == abc2svg.C.NOTE || sym.type == abc2svg.C.REST) {
			current_start[voice] = parseInt(sym.istart);
			current_end[voice] = parseInt(sym.iend);
			in_tie[voice] = (sym.ti1 == true)
			max_times[voice] = Math.max(max_times[voice], sym.time);
			var equal_times = true;
			var all_ties = true;
			var no_ties = true;
			for (var i = 0; i < data.voices.length; i++) {
				if (in_tie[i]) {
					no_ties = false;
				} else {
					all_ties = false;
				}
				if (Math.abs(max_times[i] - sym.time) > .0000001) {
					equal_times = false;
				}
			}
			if (equal_times && no_ties && sym.time > 0 && sym.time * 4 == Math.floor(sym.time * 4)) {
				for (var i = 0; i < data.voices.length; i++) {
					split_points.push([current_start[i], 1]);
				}
			}
			if (all_ties) {
				for (var i = 0; i < data.voices.length; i++) {
					split_points.push([current_end[i], 0]);
				}
			}
		}
	}
	
	split_points.sort((a,b) => a[0] - b[0]);
	
	var new_music = "";
	var start = 0;
	for (i = 0; i < split_points.length; i++) {
		var pos = split_points[i][0];
		while (pos > 0 && "([{".indexOf(music.charAt(pos-1)) >= 0) {
			pos--;
		}
		var type = (split_points[i][1] == 0 ? "JOIN" : "SPLIT");
		new_music += music.substring(start, pos) + type;
		start = pos;
	}
	new_music += music.substring(start);
	new_music = new_music.replace("\n", "\nI:linebreak <none>\n");
	var len = 0;
	var barno = 1001;
	//new_music = new_music.replaceAll(/SPLIT\s+SPLIT/g, "SPLIT");
	new_music = new_music.replaceAll(/JOIN\s+\|\s+SPLIT/g, "JOIN|");
	new_music = new_music.replaceAll(/JOIN\s+SPLIT/g, "JOIN");
	new_music = new_music.replaceAll(/\|\s+SPLIT/g, "SPBAR| ");
	new_music = new_music.replaceAll(/SPLIT\s\|/g, "SPBAR| ");
	new_music = new_music.replaceAll(/SPLIT\|/g, "SPBAR|");
	new_music = new_music.replaceAll(/JOIN\s+\|/g, " !join!{CCCC}");
	new_music = new_music.replaceAll(/JOIN\|/g, "!join!{CCCC}");
	new_music = new_music.replaceAll(/JOIN/g, "");

	new_music = new_music.replaceAll(/z\s+\|/g, "!temp!z/4z/4z/4z/4|");
	new_music = new_music.replaceAll(/z\/2/g, "!temp!z/4z/4");
	while (new_music.length != len) {
		len = new_music.length;
		new_music = new_music.replace("SPBAR", "[I:tieheight 1." + barno + "]!spb!y");
		barno++;
	}
	len = 0;
	while (new_music.length != len) {
		len = new_music.length;
		new_music = new_music.replace("SPLIT", "[I:tieheight 1." + barno + "]!sp!y|");
		barno++;
	}

	//new_music = new_music.replace(/X:\d+/, "X:1");
	//data.auto_aligned_music = new_music;
	//if (opts.wordsShown == NONE) {
	//	new_music = replace_words(new_music, null, "normal");
	//} else if (opts.wordsShown == HYMN) {
	//	new_music = replace_words(new_music, data.parsed_words[0], opts.wordSpacing);
	//}
	//console.log(new_music);

	var div = document.getElementById(spacing + "_layout_score");
	set_music(div, update_music_seqno(new_music));
}

function fillAutoAlignedMusic(spacing, tryno) {
	if (tryno > 200) {
		console.log("fillAutoAlignedMusic failed");
		return;
	}
	var div = document.getElementById(spacing + "_layout_score");
	var tune = get_tune(div);
	var music = get_music(tune);
	if (tune == null || get_music_id(music) == 1) {
		// set_music in fillLayoutMusic not complete 
		log_try("fillAutoAlignedMusic", tryno);
		setTimeout(fillAutoAlignedMusic, 5, spacing, (tryno == null ? 1 : tryno + 1));
		return;
	}
	
	var warnings = div.getElementsByTagName("pre");
	for (var i = 0; i < warnings.length; i++) {
		warnings[i].style.display = NONE;
	}
	
	var lines = music.split("\n");
	
	//lines[0] = "X:1";
	lines[1] = "I:linebreak $";

	lines_with_ties = [];
	for (var i = 3; i < lines.length; i++) {
		if (lines[i].indexOf("tieheight" > 0)) {
			lines_with_ties.push(i);
		}
	}

	var prev_rect = null;
	for (var sym = abc2svg.abc.tunes[tune][0]; sym.ts_next != null; sym = sym.ts_next) {
		var rects = div.getElementsByClassName("abcr _" + sym.istart + "_");
		if (rects.length > 0) {
			var rect = rects[0];
			if (prev_rect != null && rect.parentNode != prev_rect.parentNode) {
				var barno = ("" + Math.round(sym.fmt.tieheight * 10000)).substring(1);
				//console.log("[I:tieheight 1." + barno + "] !sp2!y");
				for (var i = 0; i < lines_with_ties.length; i++) {
					lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replace("[I:tieheight 1." + barno + "]!spb!y\|", "|$");
					lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replace("[I:tieheight 1." + barno + "]!sp!y\|", "$");
				}
			}
			prev_rect = rect;
		}
	}
	for (var i = 0; i < lines_with_ties.length; i++) {
		lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replaceAll(/\[I:tieheight ......\]!spb!y\|/g, "|");
		lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replaceAll(/\[I:tieheight ......\]!sp!y\|/g, "");
	}
	
	var new_music = "";
	for (var i = 0; i < lines.length; i++) {
		new_music += lines[i] + "\n";
	}
	new_music = new_music.replaceAll("!join!{CCCC}", "|");
	new_music = new_music.replaceAll("!temp!z/4z/4z/4z/4", "z");
	new_music = new_music.replaceAll("!temp!z/4z/4", "z/2");

	var div = document.getElementById(spacing + "_auto_score");
	set_music(div, update_music_seqno(new_music));
}
/*
function fillPaddedMusic(tryno) {
	console.log("start fillPaddedMusic");
	if (tryno > 200) {
		console.log("fillPaddedMusic failed");
		return;
	}
	var div = document.getElementById("auto_aligned_score");
	var tune = get_tune(div);
	var music = get_music(tune);
	if (tune == null || get_music_id(music) == 1) {
		// set_music in fillAutoAlignedMusic not complete
		console.log("fillPaddedMusic try " + tryno);
		setTimeout(fillPaddedMusic, 10, (tryno == null ? 1 : tryno + 1));
		return;
	}

	
	var lines = music.split("\n");

	var new_music = "";
	var in_words = false;
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].substring(0,2) == "w:" || (lines[i].substring(0,2) == "+:" && in_words)) {
			in_words = true;
			new_music += lines[i].substring(0,2) + addSpaces(lines[i].substring(2), "padded") + "\n";
		} else {
			in_words = false;
			new_music += lines[i] + "\n";
		}
	}

	abc_seq++;
	new_music = new_music.replace(/X:\d+/, "X:" + abc_seq);
	
	var div = document.getElementById("padded_score");
	set_music(div, new_music);
}
*/	

function fillEndWords(tryno) {
	if (tryno > 200) {
		console.log("fillEndWords failed");
		return;
	}
	var div = document.getElementById("normal_bar_score");
	var tune = get_tune(div);
	var music = get_music(tune);
	if (tune == null || get_music_id(music) == 1) {
		log_try("fillEndWords", tryno);
		setTimeout(fillEndWords, 5, (tryno == null ? 1 : tryno + 1));
		return;
	}
/*
	if (data.processed_music == null) {
		var lines = (data.music_with_split_points).split("\n");
		
		lines[0] = "X:1";
		lines[1] = "I:linebreak $";

		lines_with_ties = [];
		for (var i = 3; i < lines.length; i++) {
			if (lines[i].indexOf("tieheight" > 0)) {
				lines_with_ties.push(i);
			}
		}

		var prev_rect = null;
		for (var sym = abc2svg.abc.tunes[tune][0]; sym.ts_next != null; sym = sym.ts_next) {
			var rects = div.getElementsByClassName("abcr _" + sym.istart + "_");
			if (rects.length > 0) {
				var rect = rects[0];
				if (prev_rect != null && rect.parentNode != prev_rect.parentNode) {
					var barno = ("" + Math.round(sym.fmt.tieheight * 10000)).substring(1);
					//console.log("[I:tieheight 1." + barno + "] !sp2!y");
					for (var i = 0; i < lines_with_ties.length; i++) {
						lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replace("[I:tieheight 1." + barno + "]!spb!y\|", "|$");
						lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replace("[I:tieheight 1." + barno + "]!sp!y\|", "$");
					}
				}
				prev_rect = rect;
			}
		}
		for (var i = 0; i < lines_with_ties.length; i++) {
			lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replaceAll(/\[I:tieheight ......\]!spb!y\|/g, "|");
			lines[lines_with_ties[i]] = lines[lines_with_ties[i]].replaceAll(/\[I:tieheight ......\]!sp!y\|/g, "");
		}
		
		var new_music = "";
		for (var i = 0; i < lines.length; i++) {
			new_music += lines[i] + "\n";
		}
		new_music = new_music.replaceAll("!join!{CCCC}", "|");
		new_music = new_music.replaceAll("!temp!z/4z/4z/4z/4", "z");
		new_music = new_music.replaceAll("!temp!z/4z/4", "z/2");
		
		data.processed_music = new_music;
	}
	
	var new_music = data.processed_music;
	*/
	/*
	var new_music = "";
	if (opts.wordsShown == CODES) {
		new_music = data.processed_music;
	} else if (opts.wordsShown == NONE) {
		new_music = replace_words(data.processed_music, null, "normal");
	} else {
		new_music = replace_words(data.processed_music, data.parsed_words[0], opts.wordSpacing);
	}
	*/
	
	//abc_seq++;
	//new_music = new_music.replace("X:1", "X:" + abc_seq);
	//console.log(new_music);

	//var div = document.getElementById("score_view_main");
	//set_music(div, new_music);
	//if (opts.wordsShown == HYMN) {
		//prepare_music(div);
	//}
	var svgs = div.getElementsByTagName("svg");
	if (svgs.length > 0) {
		Pagesize = parseInt(svgs[0].getAttribute("width").replace("px", "")) + 50;
	}
	
	var end_words_div = document.getElementById("score_view_end_words");
	while (end_words_div.firstChild != null) {
		end_words_div.removeChild(end_words_div.firstChild);
	}
	fill_in_text(end_words_div, true);
	var end_verse_divs = [];
	var widths = [];
	var max_width = 0;
	for (var node = end_words_div.firstChild; node != null; node = node.nextSibling) {
		if (node.localName == "div") {
			end_verse_divs.push(node);
			var width = node.getBoundingClientRect().width;
			widths.push(width);
			max_width = Math.max(width, max_width);
		}
	}
	if (end_verse_divs.length > 0) {
		var cols = 5;
		while (cols > 0 && max_width * cols > Pagesize) {
			cols--;
		}
		var rows = Math.ceil(end_verse_divs.length / cols);
		while (cols > 2 && Math.ceil(end_verse_divs.length / (cols - 1)) == rows) {
			cols--;
		}
		var table = document.createElement("table");
		table.style.width = Pagesize + "px";
		for (var row = 0; row < rows; row++) {
			for (var col = 0; col < cols; col++) {
				var td;
				if (col == 0) {
					tr = document.createElement("tr");
					table.appendChild(tr);
				}
				var td = document.createElement("td");
				var i = col * rows + row;
				if (i < end_verse_divs.length) {
					td.appendChild(end_verse_divs[i]);
					end_verse_divs[i].style.visibility = "";
				}
				tr.appendChild(td);
			}
		}
		end_words_div.appendChild(table);
		end_words_div.appendChild(document.createElement("br"));
	}
}

function fillPresentationMusic(tryno) {
	if (tryno > 200) {
		console.log("fillPresentationMusic failed");
		return;
	}
	if (data.presentation_music == null) {
		log_try("fillPresentationMusic", tryno);
		setTimeout(fillPresentationMusic, 10, (tryno == null ? 1 : tryno + 1));
		return;
	}
	
	var presentation_music = data.presentation_music.replaceAll("I:linebreak $", "I:linebreak <none>").replaceAll(" $", " ");
	
	Present_main.style.transform = "";
	Present_main.style.height = "";
	Present_main.style.width = "";

	var v = 0;
	var div = document.getElementById("v0");
	while (div != null && v <= data.verseCount) {
		div.style.transform = "";
		div.style.height = "";
		div.style.width = "";
		div.style.display = "";
		//console.log("on " + v);
		var new_music = replace_words(presentation_music, data.parsed_words[v + 1], "present");
		if (v == 0) {
			new_music = new_music.replace("[P:VERSE nn]", "");
		} else {
			new_music = new_music.replace("[P:VERSE nn]", "[P:VERSE " + v + "]");
		}
		var lines = new_music.split("\n");
		new_music = "";
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].substr(0,12) == "%%pagewidth ") {
				new_music += "%%pagewidth 2000cm\n%%stretchlast 0\n%%notespacingfactor 1.5, 50\n";
			} else {
				new_music += lines[i] + "\n";
			}
		}
		//console.log(v + ": " + new_music)
		var div2 = div.getElementsByTagName("div")[0];
		set_music(div, update_music_seqno(new_music));
		//if (opts.wordsShown == HYMN) {
		//prepare_music(div);
		//}
		/*
		var svgs = div2.getElementsByTagName("svg");
		if (svgs.length > 0) {
			var tspans = svgs[1].getElementsByTagName("tspan");
			for (var i = 0; i < tspans.length; i++) {
				if (tspans[i].textContent == "=") {
					tspans[i].parentNode.style.display = NONE;
				}
			}
		}
		*/
		v++;
		div = document.getElementById("v" + v);
    }
	
	//updateView();
	//fully_loaded = true;
}

function selectBestLayout(tryno) {
	var div1 = document.getElementById("normal_auto_score");
	var tune1 = get_tune(div1);
	var music1 = get_music(tune1);
	var div2 = document.getElementById("padded_auto_score");
	var tune2 = get_tune(div2);
	var music2 = get_music(tune2);
	if (tune1 == null || get_music_id(music1) == 1 || tune2 == null || get_music_id(music2) == 1) {
		log_try("selectBestLayout", tryno);
		setTimeout(selectBestLayout, 5, (tryno == null ? 1 : tryno + 1));
		return;
	}

	var unfiltered_divs = document.getElementsByClassName("score_option");
	var divs = []
	for (var i = 0; i < unfiltered_divs.length; i++) {
		if (unfiltered_divs[i].id != "no_words_score" && unfiltered_divs[i].id != "codewords_score") {
			divs.push(unfiltered_divs[i]);
		}
	}
	var line_counts = [];
	var smallest_line_count = 999;
	var max_deviations = [];
	var rects_count = document.getElementById("normal_bar_score").getElementsByTagName("rect").length;
	for (var i = 0; i < divs.length; i++) {
		var svgs = divs[i].getElementsByTagName("svg");
		// svg[0] is the title block, the rest contain note rects
		var line_count = svgs.length - 1;
		line_counts.push(line_count);
		smallest_line_count = Math.min(smallest_line_count, line_count);
		var avg_rects_per_line = rects_count / line_count;
		max_deviations.push(0);
		for (var j = 1; j < svgs.length; j++) {
			var deviation = Math.abs(svgs[j].getElementsByTagName("rect").length - avg_rects_per_line);
			//console.log(divs[i].id + " line " + j + ": " + deviation)
			max_deviations[i] = Math.max(max_deviations[i], deviation);
		}
	}
	var smallest_max_deviation = 999;
	for (var i = 0; i < divs.length; i++) {
		if (line_counts[i] == smallest_line_count) {
			if (max_deviations[i] <= smallest_max_deviation) {
				 smallest_max_deviation = max_deviations[i];
			}
		}
	}
	//console.log(max_deviations)

	var best_layouts = ":";
	for (var i = 0; i < divs.length; i++) {
		if (line_counts[i] == smallest_line_count && max_deviations[i] == smallest_max_deviation) {
			best_layouts += divs[i].id + ":";
		}
	}
	
	ordered_preferences = ["padded_auto_score", "normal_auto_score", "padded_bar_score", "normal_bar_score"];
	for (var i = 0; i < ordered_preferences.length; i++) {
		if (best_layouts.indexOf(ordered_preferences[i]) > 0) {
			Best_layout = ordered_preferences[i];
			break;
		}
	}

	if (opts.manageBreaksAndSpacing) {
		opts.breakOnlyOnBars = (Best_layout.indexOf("bar") >= 0);
		opts.forceSpaceBetweenWords = (Best_layout.indexOf("padded") >= 0);
		document.getElementById("break_only_on_bars").checked = opts.breakOnlyOnBars;
		document.getElementById("force_space_between_words").checked = opts.forceSpaceBetweenWords;
	}
	
	updateView();

/*
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].id != Best_layout) {
			divs[i].style.backgroundColor = "#dddddd";
		}
	}
	*/
}

function page_loaded() {
	Score_view = document.getElementById("score_view");
	Text_view = document.getElementById("text_view");
	Presentation_view = document.getElementById("presentation_view");
	Present_header = document.getElementById("present_header");
	Present_main = document.getElementById("present_main");
	Present_footer = document.getElementById("present_footer");
	Tempo_value = document.getElementById("tempo_value");
	Play_pause_resume = document.getElementById("play_pause_resume");
	Reset = document.getElementById("reset");
    Indexframe = document.getElementById("indexframe");
    Col1 = document.getElementById("col1");
    Col1_top = document.getElementById("col1_top");
    Col2 = document.getElementById("col2");
    Col2_top = document.getElementById("col2_top");
    Col2_site_icon = document.getElementById("col2_site_icon");
    Col2_title = document.getElementById("col2_title");
    Col2_arrow = document.getElementById("col2_arrow");
	Col3 = document.getElementById("col3");
    Col3_top = document.getElementById("col3_top");
    Col3_site_icon = document.getElementById("col3_site_icon");
	Col3_double_arrow = document.getElementById("col3_double_arrow");
	Col3_arrow = document.getElementById("col3_arrow");
	
    Col1_top_rect = Col1_top.getBoundingClientRect();
    Col1_width = Col1_top_rect.right;
	ColSpacer_width = Col2_top.getBoundingClientRect().left - Col1_width;

	var ua = navigator.userAgent;
	for (var i = 0; i < BOTS.length; i++) {
		if (ua.match(BOTS[i])) {
			BotDetected = true;
			break;
		}
	}

	if (!BotDetected) {
		var query = window.location.search.toLowerCase();
		if (query.indexOf("view=text") >= 0) {
			View = TEXT
		} else if (query.indexOf("view=score") >= 0) {
			View = SCORE
		} else if (query.indexOf("view=presentation") >= 0) {
			View = PRESENTATION
		} else {
			col1_dismissed = !space_for_cols(false, false, false, TEXT);
			col2_dismissed = false;
			col3_dismissed = !space_for_cols(col1_dismissed, false, false, TEXT);
			View = (space_for_cols(col1_dismissed, false, col3_dismissed, SCORE) ? SCORE : TEXT);
		}
	}
  
	abc2svg.no_midi = true;
  
	if (!ON_LOCALHOST && window.location.hostname.indexOf("freehymns.org") < 0) {
		var site_links = document.getElementsByClassName("site_link");
		for (var i = 0; i < site_links.length; i++) {
			site_links[i].textContent = site_links[i].textContent.replace("freehymns.org", window.location.hostname);
		}
	}

	load_text_data(text_data_loaded);
}

function text_data_loaded() {
	parse_text_data();
	load_music_data(music_data_loaded);
}

function music_data_loaded() {
	fully_loaded = true;
	parse_music_data();

	fill_col2();
	fill_text_view();
	//fill_score_view();
	reset_music_div("no_words_score");
	reset_music_div("codewords_score");
	reset_music_div("normal_bar_score");
	reset_music_div("normal_layout_score");
	reset_music_div("normal_auto_score");
	reset_music_div("padded_bar_score");
	reset_music_div("padded_layout_score");
	reset_music_div("padded_auto_score");
	fill_present_view();

    changeTempo(0);

	abc2svg.global_params = "%%soundfont ../akai_steinway.sf2";
	//abc2svg.global_params = "%%soundfont ../SC55Piano_V2.js";
	dom_loaded();
	
	//calcSplitPoints();
	//layoutMusic();
	displayMusic();
}

function get_folder_name(filename) {
	if (filename.charAt(0) == "A" && filename.charAt(1) == filename.charAt(1).toUpperCase()) {
		return "an";
	} else if (filename.substring(0, 2) == "An" && filename.charAt(2) == filename.charAt(2).toUpperCase()) {
		return "an";
	} else if (filename.charAt(0) == "I" && filename.charAt(1) == filename.charAt(1).toUpperCase()) {
		return "i_";
	} else if (filename.charAt(0) == "O" && filename.charAt(1) == filename.charAt(1).toUpperCase()) {
		return "oh";
	} else if (filename.substring(0, 2) == "Oh" && filename.charAt(2) == filename.charAt(2).toUpperCase()) {
		return "oh";
	} else if (filename.substring(0, 3) == "The" && filename.charAt(3) == filename.charAt(3).toUpperCase()) {
		return "the";
	} else {
		return filename.charAt(0).toLowerCase();
	}
}

function load_text_data(callback) {
  var div = null;
  if (!fully_loaded) {
	div = document.getElementById("text_data");
  }
  if (div == null) {
	var href = window.location.href + "&";
	var i = href.indexOf("lang=");
	if (i > 0 && !fully_loaded) {
		data.text_lang = href.substring(i+5, href.indexOf("&", i));
	}
	if (data.text_lang == null) {
		data.text_lang = "en";
	}
	i = href.indexOf("id=");
	if (i > 0 && !fully_loaded) {
		data.textID = href.substring(i+3, href.indexOf("&", i));
	}
	console.assert(data.textID != null, "Can't determine hymn text file id.");
	i = href.indexOf("var=");
	if (i > 0 && !fully_loaded) {
		data.text_variant = href.substring(i+4, href.indexOf("&", i));
	}
	var url = "../";
	if (href.indexOf("/site") >= 0) {
		url += "../";
	}
	url += "hymns/" + data.text_lang + "/" + get_folder_name(data.textID) + "/" + data.textID + ".txt";
	document.getElementById("download_text").href = url;
	document.getElementById("download_text").setAttribute("download", data.textID + ".txt");
	url += "?" + Math.ceil(Math.random() * 10000);
	fetch(url)
	  .then((res) => res.text())
	  .then((txt) => {
		data.raw_text = txt;
		parse_text_data();
		text_data_loaded();
	  })
	  .catch((e) => console.error(e));
  } else {
	data.raw_text = div.textContent;
	callback();
  }
}

function load_music_data(callback) {
  var div = null;
  if (!fully_loaded) {
	div = document.getElementById("music_data");
  }
  if (div == null) {
	var href = window.location.href + "&";
	if (data.musicID == null) {
		var i = href.indexOf("music=");
		if (i > 0) {
			data.musicID = href.substring(i+6, href.indexOf("&", i+6));
		} else if (data.text_fields[TUNE] != null) {
			data.musicID = data.text_fields[TUNE][0];
		} else {
			data.musicID = data.textID;
		}
	}
	console.assert(data.musicID != null, "Can't determine music file id.");

	//addFieldValue(data.text_fields, "Alt Tune", data.musicID);
	
	if (data.text_fields["Alt Tune"] == null) {
		data.text_fields["Alt Tune"] = [data.musicID];
	} else {
		if (!data.text_fields["Alt Tune"].includes(data.musicID)) {
			data.text_fields["Alt Tune"].push(data.musicID);
		}
	}

	var url = "../";
	if (href.indexOf("/site") >= 0) {
		url += "../";
	}
	url += "hymns/music/" + get_folder_name(data.musicID) + "/" + data.musicID + ".abc";
	document.getElementById("download_music").href = url;
	document.getElementById("download_music").setAttribute("download", data.musicID + ".abc");
	url += "?" + Math.ceil(Math.random() * 10000);
	fetch(url)
	  .then((res) => res.text())
	  .then((music) => {
		data.raw_music = music;
		music_data_loaded();
	  })
	  .catch((e) => console.error(e));
  } else {
	data.raw_music = div.textContent;
	callback();
  }
}

/*
function fill_score_view() {
	var div = document.getElementById("score_view_main");
	while (div.firstChild != null) {
		div.removeChild(div.firstChild);
	}
	var script = document.createElement("script");
	script.setAttribute("type", "text/vnd.abc");
	script.appendChild(document.createTextNode(NULL_ABC));
	div.appendChild(script);
}
*/
function reset_music_div(id) {
	var div = document.getElementById(id);
	while (div.firstChild != null) {
		div.removeChild(div.firstChild);
	}
	var script = document.createElement("script");
	script.setAttribute("type", "text/vnd.abc");
	script.appendChild(document.createTextNode(NULL_ABC));
	div.appendChild(script);
}

function fill_present_view() {
	var container = document.getElementById("present_main");
	for (var v = 0; v <= data.verseCount; v++) {
		var div = document.getElementById("v" + v);
		if (div == null) {
			div = document.createElement("div");
			div.id = "v" + v;
			var script = document.createElement("script");
			script.setAttribute("type", "text/vnd.abc");
			script.appendChild(document.createTextNode(NULL_ABC));
			div.appendChild(script);
			container.appendChild(div);
		}
	}
	
	document.getElementById("present_title").textContent = data.text_title;

	while (Present_footer.firstChild != null) {
		Present_footer.removeChild(Present_footer.firstChild);
	}
	if (data.text_fields[AUTHOR] != null) {
		addSpan(Present_footer, "Text: " + getFieldValues(data.text_fields, AUTHOR), true);
	}
	if (data.music_fields[COMPOSER] != null) {
		addSpan(Present_footer, "Music: " + getFieldValues(data.music_fields, COMPOSER), true);
	}
	//addSpan(Present_footer, "Text Terms:" + getFieldValues(data.text_fields, TERMS), false);
	//addSpan(Present_footer, "Music Terms:" + getFieldValues(data.music_fields, TERMS), false);
}

function fill_col2() {
	Col2_title.textContent = data.text_title;
	
	var tmdt = document.getElementById("text_metadata_table");
	var mmdt = document.getElementById("music_metadata_table");
	var tvt = document.getElementById("text_variants_table");
	var mat = document.getElementById("music_arrangements_table");
	var matt = document.getElementById("music_alt_tunes_table");
	var svt = document.getElementById("score_verses_table");
	var tables = [tmdt, mmdt, mat, matt, tvt, svt];
	for (var i = 0; i < tables.length; i++) {
		while (tables[i].firstChild != null) {
			tables[i].removeChild(tables[i].firstChild);
		}
	}

	var text_variants =  0;
	var alt_tunes = 0;
	var arrangements = 1;
	
	addRadioRow(mat, "arrangement", data.musicID, true);
	
	var fields = Object.keys(data.text_fields).sort();
	for (var i = 0; i < fields.length; i++) {
		var values = data.text_fields[fields[i]].toSorted();
		for (var j = 0; j < values.length; j++) {
			var value = values[j];
			if (fields[i] == "VarianT") {
				var checked = (value == data.text_variant || (value == "" && data.text_variant == null));
				if (value == "") {
					value = data.textID;
					if (values.length > 1) {
						value += " (Default)";
					}
				} else {
					value = data.textID + " (" + value + ")";
				}
				if (values.length > 1 || data.text_fields["Variant"] != null) {
					addRadioRow(tvt, "text_variant", value, checked, "changeText()");
				}
				text_variants++;
			} else if (fields[i] == "Variant") {
				var checked = (value == data.textID && data.text_variant == null);
				addRadioRow(tvt, "text_variant", value, checked, "changeText()");
				text_variants++;
			} else if (fields[i] == "Tune") {
				// skip
			} else if (fields[i] == "Alt Tune") {
				if (value != data.musicID) {
					addRadioRow(matt, "tune", value, false, "changeMusic()");
					alt_tunes++;
				}
			} else {
				addMetadataRow(tmdt, fields[i], value);
			}
		}
	}
	
	var fields = Object.keys(data.music_fields).sort();
	for (var i = 0; i < fields.length; i++) {
		var values = data.music_fields[fields[i]].toSorted();
		for (var j = 0; j < values.length; j++) {
			var value = values[j];
			if (fields[i] == "Variant") {
				addRadioRow(mat, "arrangement", value, false, "changeMusic()");
				arrangements++;
			} else {
				if (fields[i] == "Source" || fields[i] == "Sources") {
					value = value.replaceAll("(tm)", "\u2122");
				}
				addMetadataRow(mmdt, fields[i], value);
			}
		}
	}

	document.getElementById("text_variants_none").style.display = (text_variants <= 1 ? INLINE : NONE);
	document.getElementById("music_alt_tunes_none").style.display = (alt_tunes == 0 ? INLINE : NONE);
	document.getElementById("music_other_arrangements_none").style.display = (arrangements == 1 ? INLINE : NONE);
	
	for (var i = 0; i < data.verseCount; i++) {
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		th.appendChild(document.createTextNode("Verse " + (i+1) + "."));
		tr.appendChild(th);
		var td = document.createElement("td");
		var sel = document.createElement("select");
		var opt1 = document.createElement("option");
		opt1.appendChild(document.createTextNode("Show in score"));
		sel.appendChild(opt1);
		var opt2 = document.createElement("option");
		opt2.appendChild(document.createTextNode("Show after score"));
		sel.appendChild(opt2);
		var opt3 = document.createElement("option");
		opt3.appendChild(document.createTextNode("Hide"));
		sel.appendChild(opt3);
		var opt4 = document.createElement("option");
		opt4.appendChild(document.createTextNode("Remove"));
		sel.appendChild(opt4);
		sel.setAttribute("onchange", "changeVerseShown()");
		sel.selectedIndex = opts.versesShown[i+1];
		td.appendChild(sel);
		tr.appendChild(td);
		svt.appendChild(tr);
	}
	
	fill_transpose_steps();
	
	fillPerformancePlan();
}

function fill_transpose_steps(evt) {
	var sel = document.getElementById("transpose_steps");
	while (sel.firstChild != null) {
		sel.removeChild(sel.firstChild);
	}
	var key = "C";
	if (data.music_fields[KEYSIG] != null) {
		key = data.music_fields[KEYSIG][0];
	}
	var index = 0;
	var type = "major";
	for (i = 0; i < 12; i++) {
		if (KEY_TABLE[i].major == key) {
			index = i;
			break;
		}
		if (KEY_TABLE[i].minor == key) {
			index = i;
			type = "minor";
			break;
		}
	}
	var inc = 1;
	if (evt != null) {
		if (evt.target.value == "Down") {
			inc = -1;
		}
	}
	for (i = 0; Math.abs(i) <= 12; i += inc) {
		var opt = document.createElement("option");
		var j = i + index;
		if (j > 12) {
			j -= 12;
		}
		if (j < 0) {
			j += 12;
		}
		opt.value = i * inc;
		var label = Math.abs(i) + " semitone" + (i*i == 1 ? "" : "s") + " (from " + key + " to " + KEY_TABLE[j][type] + ")";
		opt.appendChild(document.createTextNode(label));
		sel.appendChild(opt);
	}
}

function fill_text_view() {
	var div = document.getElementById("text_block");
	while (div.firstChild != null) {
		div.removeChild(div.firstChild);
	}
	var h = document.createElement("h3");
	h.className = "text_title";
	h.appendChild(document.createTextNode(data.text_title));
	div.appendChild(h);
	fill_in_text(div, false);
	if (data.text_fields[AUTHOR] != null) {
		var p = document.createElement("p");
		p.className = "text_attribution";
		p.appendChild(document.createTextNode("\u2014 " + getFieldValues(data.text_fields, AUTHOR)));
		div.appendChild(p);
	}
}

function fill_in_text(div, just_end_words) {
	var prev_part = null;
	var prev_lo_verse = null;
	var stanzaDiv = null;
	var section = null;
	for (var i = 0; i < data.stanzas.length; i++) {
		var stanza = data.stanzas[i];
		if (stanza.lines != null && stanza.lines.length > 0) {
			if (just_end_words && (stanza.partname != "Verses" || opts.versesShown[stanza.loVerse] != AFTER_SCORE)) {
				continue;
			}
			if (stanza.partname.charAt(0) == "_") {
				continue;
			}
			if (stanza.partname + stanza.loVerse + "-" + stanza.hiVerse != prev_part || stanza.description != null) {
				stanzaDiv = document.createElement("div");
				stanzaDiv.className = "stanza";
				var span = document.createElement("span");
				span.className = "stanza_heading";
				stanzaDiv.appendChild(span);
				if (stanza.partname == "Verses" && stanza.description == null) {
					var label = (just_end_words ? data.verse_labels[stanza.loVerse] : stanza.loVerse) + ".";
					span.appendChild(document.createTextNode(label));
				} else {
					var heading = stanza.partname;
					if (stanza.description != null) {
						heading += " (" + stanza.description + ")";
					}
					span.appendChild(document.createTextNode(heading + ":"));
					stanzaDiv.appendChild(document.createElement("br"));
				}
				if (just_end_words) {
					stanzaDiv.style.visibility = "hidden";
					stanzaDiv.style.display = INLINE_BLOCK;
				}
				div.appendChild(stanzaDiv);
			}
			var line_container = stanzaDiv;
			if (stanza.section == null) {
				section == null;
			} else {
				if (section == null) {
					section = document.createElement(stanza.useTable ? "table" : "div");
					section.className = "stanza_section";
					stanzaDiv.appendChild(section);
				}
				if (stanza.useTable) {
					var tr = document.createElement("tr");
					var td1 = document.createElement("td");
					td1.className = "stanza_section_heading";
					td1.appendChild(document.createTextNode(stanza.section + ":"));
					tr.appendChild(td1);
					var td2 = document.createElement("td");
					tr.appendChild(td2);
					section.appendChild(tr);
					line_container = td2;
				} else {
					var div2 = document.createElement("div");
					var span = document.createElement("span");
					span.className = "stanza_section_heading";
					span.appendChild(document.createTextNode(stanza.section + ":"));
					div2.appendChild(span);
					div2.appendChild(document.createElement("br"));
					section.appendChild(div2);
					line_container = div2;
				}
			}
			for (var j = 0; j < stanza.lines.length; j++) {
				var line = stanza.lines[j].replaceAll("-", "").replaceAll("_", "").replaceAll("~", "").replaceAll("=", "");
				line = decodeSpecials(line, false);
				var parts = line.split("\\n");
				for (var k = 0; k < parts.length; k++) {
					line_container.appendChild(document.createTextNode(parts[k]));
					line_container.appendChild(document.createElement("br"));
				}
			}
			prev_part = stanza.partname + stanza.loVerse + "-" + stanza.hiVerse;
		}
	}
}

function resize() {
  redraw(true);
}

function toggle_mobile_menu() {
	var style = document.getElementById("mobile_menu").style;
	update_mobile_shortcuts();
	style.display = (style.display == NONE ? INLINE_BLOCK : NONE);
}

function update_mobile_shortcuts() {
	var show_shortcuts = (!('ontouchstart' in document.documentElement) || KeyboardDetected);
	document.getElementById("play_pause_resume_shortcut").style.display = (show_shortcuts ? INLINE : NONE);
	document.getElementById("reset_shortcut").style.display = (show_shortcuts && abc2svg.verse_playing != null ? INLINE : NONE);
	document.getElementById("info_shortcut").style.display = (show_shortcuts && abc2svg.verse_playing == null ? INLINE : NONE);
}

function show_hymn_details() {
	document.getElementById("mobile_menu").style.display = NONE;
	resetMusic();
	col2_dismissed = false;
	View = SCORE;
	if (!space_for_cols(col1_dismissed, col2_dismissed, col3_dismissed, View)) {
		View = TEXT;
	}
	if (!space_for_cols(col1_dismissed, col2_dismissed, col3_dismissed, View)) {
		col1_dismissed = true;
	}
	if (!space_for_cols(col1_dismissed, col2_dismissed, col3_dismissed, View)) {
		col3_dismissed = true;
	}
	updateView();
}

function goto_index() {
	window.location.href = document.getElementById("indexframe").src;
}

function go_home() {
	window.location.href = "..";
}

function close_col1() {
	col1_dismissed = true;
	redraw(false);
}

function close_col2() {
	if (col1_dismissed && col3_dismissed) {
		goto_index();
		return;
	}
	col2_dismissed = true;
	redraw(false);
}

function show_col1() {
	if (col1_dismissed) {
		if (!space_for_cols(false, false, true, View)) {
			goto_index();
			return;
		}
		col1_dismissed = false;
		if (!space_for_cols(col1_dismissed, col2_dismissed, col3_dismissed, View)) {
			if (space_for_cols(col1_dismissed, col2_dismissed, col3_dismissed, TEXT)) {
				if (View != TEXT) {
					View = TEXT;
					updateView();
					return;
				}
			}
			col3_dismissed = true;
		}
		redraw(false);
		document.getElementById("indexframe").contentWindow.postMessage("load_index_state");
	}
}

function show_col2() {
	col2_dismissed = false;
	if (!space_for_cols(col1_dismissed, col2_dismissed, col3_dismissed, View)) {
		col1_dismissed = true;
	}
	redraw(false);
}

function redraw(resize) {
	if (Col1 == null) {
		return;
	}
	
	var vars = document.querySelector(":root").style;

	var col1_default_width = Col1_width;
	var col2_min_width = Col1_width;
	var col2_max_width = Col1_width * 1.5;
	
	if (View == PRESENTATION) {
		vars.setProperty("--col3-margin", 0);
	} else if (!col1_dismissed && col2_dismissed && col3_dismissed) {
		//This shouldn't happen
		Col1.style.width = "100%";
	} else if (col1_dismissed && !col2_dismissed && col3_dismissed) {
		Col2.style.width = "100%";
		Col2.style.left = 0;
	} else if (col1_dismissed && col2_dismissed && !col3_dismissed) {
		vars.setProperty("--col3-margin", 0);
	} else if (!col1_dismissed && !col2_dismissed && col3_dismissed) {
		Col1.style.width = col1_default_width + "px";
		Col2.style.width = (window.innerWidth - col1_default_width - ColSpacer_width) + "px";
		Col2.style.left = (col1_default_width + ColSpacer_width) + "px";
	} else if (!col1_dismissed && col2_dismissed && !col3_dismissed) {
		Col1.style.width = col1_default_width + "px";
		vars.setProperty("--col3-margin", (col1_default_width + ColSpacer_width) + "px");
	} else if (!col2_dismissed && !col3_dismissed) {
		var col1_adjustment = 0;
		if (!col1_dismissed) {
			col1_adjustment = col1_default_width + ColSpacer_width;
			Col1.style.width = col1_default_width;
		}
		Col2.style.left = col1_adjustment + "px";
		var col3_desired_width = Pagesize;
		if (View == TEXT) {
			col3_desired_width = (window.innerWidth - col1_adjustment - ColSpacer_width) / 2;
		}
		var w = window.innerWidth - col1_adjustment - ColSpacer_width - col3_desired_width;
		if (w >= col2_min_width && w <= col2_max_width) {
			Col2.style.width = w + "px";
			vars.setProperty("--col3-margin", (col1_adjustment + w + ColSpacer_width) + "px");
		} else if (w > col2_max_width) {
			Col2.style.width = col2_max_width + "px";
			vars.setProperty("--col3-margin", (col1_adjustment + col2_max_width + ColSpacer_width) + "px");
		} else {
			Col2.style.width = col2_min_width + "px";
			vars.setProperty("--col3-margin", (col1_adjustment + col2_min_width + ColSpacer_width) + "px");
		}
	}
	
	Col2_top.style.width = Col2.style.width;
	var col2_rect = Col2.getBoundingClientRect();
	document.getElementById("col2_contents").style.width = Col2.style.width;
	var md_frames = document.getElementsByClassName("metadata_frame");
	for (var i = 0; i < md_frames.length; i++) {
		md_frames[i].style.maxWidth = (col2_rect.left + col2_rect.width - md_frames[i].getBoundingClientRect().left - 10) + "px";
	}

	if (col1_dismissed || View == PRESENTATION) {
	  Col1.style.display = NONE;
	  Indexframe.style.display = NONE;
	} else {
	  Col1.style.display = "";
	  Indexframe.style.height = (document.documentElement.clientHeight - Col1_top_rect.bottom) + "px";
	  Indexframe.style.display = BLOCK;
	}
	if (col2_dismissed || View == PRESENTATION) {
	  Col2.style.display = NONE;
	} else {
	  Col2_arrow.style.display = (col1_dismissed ? BLOCK : NONE);
	  Col2_site_icon.style.display = (col1_dismissed ? BLOCK : NONE);
	  Col2_title.style.paddingLeft = (col1_dismissed ? "" : "4px");
	  Col2.style.height = document.documentElement.clientHeight + "px";
	  Col2.style.display = "";
	}
	Col3.style.display = (col3_dismissed ? NONE: BLOCK);
	var show_mobile_controls = ((col1_dismissed && col2_dismissed) || View == PRESENTATION);
	Col3_arrow.style.display = ((col2_dismissed && !show_mobile_controls) ? BLOCK : NONE);
	var titles = document.getElementsByClassName("text_title");
	if (titles.length > 0) {
		var x = titles[0].getBoundingClientRect().left;
		titles[0].style.marginLeft = ((show_mobile_controls && window.innerHeight < 800 && x < 80) ? ((80 - x) + "px") : 0);
		titles[0].style.paddingTop = ((show_mobile_controls && window.innerHeight >= 800 && x < 80) ? "30px" : 0);
	}
	update_mobile_shortcuts();
	document.getElementById("present_header").style.paddingLeft = (show_mobile_controls ? "2em" : "");
	document.getElementById("mobile_controls").style.display = (show_mobile_controls ? BLOCK : NONE);
}

function toggle_tree_node() {
	var div = window.event.target;
	while (div && !div.id) {
		div = div.parentNode;
	}
	var spans = div.getElementsByTagName("span");
	div = document.getElementById(div.id.replace("title", "node"));
	if (spans[1].textContent == PLUS) {
		spans[1].innerHTML = NDASH;
		div.style.display = BLOCK;
	} else {
		spans[1].innerHTML = PLUS;
		div.style.display = NONE;
	}
}

function keyDown(ev) {
	if (ev.target.tagName != "input") {
		KeyboardDetected = true;
	}
	
	if (!!ev.shiftKey) {
		if (ev.keyCode == 38) {
			changeTempo(1);
		} else if (ev.keyCode == 40) {
			changeTempo(-1);
		}
	}
	if (ev.key == " ") {
		document.getElementById("mobile_menu").style.display = NONE;
		if (abc2svg.verse_playing == null) {
			play();
		} else if (playing) {
			pause();
		} else {
			resume();
		}
	}
	if (ev.keyCode == 27) {
		document.getElementById("mobile_menu").style.display = NONE;
		if (abc2svg.verse_playing == null) {
			show_hymn_details();
		} else {
			resetMusic();
		}
	}
}

function changeView(new_view, wordsShown) {
	if (!space_for_cols(col1_dismissed, col2_dismissed, false, new_view)) {
		col1_dismissed = true;
	}
	if (!space_for_cols(col1_dismissed, col2_dismissed, false, new_view)) {
		col2_dismissed = true;
	}
	col3_dismissed = false;
	if (abc2svg.verse_playing != null && View != new_view && (View == PRESENTATION || new_view == PRESENTATION)) {
		resetMusic();
	}
	View = new_view;
    var changed = opts.scoreChanged;
	if (wordsShown != null) {
		changed = changed || wordsShown != opts.wordsShown;
		opts.wordsShown = wordsShown;
	}
	if (View == SCORE || View == PRESENTATION) {
		if (changed) {
			opts.scoreChanged = false;
			parse_music_data();
			//layoutMusic();
			//loadMusic();
			displayMusic();
			return;
		}
	}
	updateView();
}

function get_current_score_div() {
	if (opts.wordsShown == NONE) {
		return document.getElementById("no_words_score");
	} else if (opts.wordsShown == CODES) {
		return document.getElementById("codewords_score");
	} else if (opts.wordsShown == HYMN && !opts.forceSpaceBetweenWords && opts.breakOnlyOnBars) {
		return document.getElementById("normal_bar_score");
	} else if (opts.wordsShown == HYMN && !opts.forceSpaceBetweenWords && !opts.breakOnlyOnBars) {
		return document.getElementById("normal_auto_score");
	} else if (opts.wordsShown == HYMN && opts.forceSpaceBetweenWords && opts.breakOnlyOnBars) {
		return document.getElementById("padded_bar_score");
	} else if (opts.wordsShown == HYMN && opts.forceSpaceBetweenWords && !opts.breakOnlyOnBars) {
		return document.getElementById("padded_auto_score");
	}
/*
	var divs = document.getElementsByClassName("score_option");
	for (var i = 0; i < divs.length; i++) {
		if (divs[i].style.display == BLOCK) {
			return divs[i];
		}
	}
*/
}

function updateView() {
	document.getElementById("view_resource").style.display = NONE;
	/*document.getElementById("no_words_score").style.display = (opts.wordsShown == NONE ? BLOCK : NONE);
	document.getElementById("codewords_score").style.display = (opts.wordsShown == CODES ? BLOCK : NONE);
	document.getElementById("normal_bar_score").style.display = (opts.wordsShown == HYMN && !opts.forceSpaceBetweenWords && opts.breakOnlyOnBars ? BLOCK : NONE);
	document.getElementById("normal_auto_score").style.display = (opts.wordsShown == HYMN && !opts.forceSpaceBetweenWords && !opts.breakOnlyOnBars ? BLOCK : NONE);
	document.getElementById("padded_bar_score").style.display = (opts.wordsShown == HYMN && opts.forceSpaceBetweenWords && opts.breakOnlyOnBars ? BLOCK : NONE);
	document.getElementById("padded_auto_score").style.display = (opts.wordsShown == HYMN && opts.forceSpaceBetweenWords && !opts.breakOnlyOnBars ? BLOCK : NONE);*/
	var score_div = get_current_score_div();
	var divs = document.getElementsByClassName("score_option");
	for (var i = 0; i < divs.length; i++) {
		divs[i].style.display = (divs[i] == score_div ? BLOCK : NONE);
	}
/*
	if (playing) {
		var divs = document.getElementsByClassName("score_option");
		for (var i = 0; i < divs.length; i++) {
			if (divs[i].style.display == BLOCK) {
				var tune = get_tune(divs[i]);
				abc2svg.tune_index_playing = tune;
				break;
			}
		}
	}
*/
	Score_view.style.display = (View == SCORE ? BLOCK : NONE);
	Text_view.style.display = (View == TEXT ? BLOCK : NONE);
	Presentation_view.style.display = (View == PRESENTATION ? BLOCK : NONE);
	Col1.style.display = (View == PRESENTATION ? NONE : BLOCK);
  
	if (View == PRESENTATION) {
		col1_dismissed = true;
		if (Present_main.style.transform == "") {
			update_presentation_divs();
		}
	}
	redraw(false);
}

function clean_music(music) {
	var new_music = music.replace(/X:\d+/, "X:1");
	//new_music = new_music.replaceAll(/\s*&#x20..;&#xfe..;&#x20..;&#xfe..;&#x20..;&#xfe..;/g, " ");
	new_music = new_music.replaceAll(/&#x20..;&#xfe..;&#x20..;&#xfe..;&#x20..;&#xfe..;/g, "");
	//new_music = new_music.replaceAll("w: ", "w:").replaceAll("+: ", "+:");
	return new_music;
}

function view_resource(resource_text) {
	var pre = document.getElementById("view_resource");
	pre.textContent = resource_text;
	var div = get_current_score_div();
	div.style.display = NONE;
	pre.style.display = BLOCK;
}

function view_text_resource() {
	view_resource(data.raw_text);
}

function view_music_resource() {
	view_resource(data.raw_music);
}

function view_score_resource() {
	var div = get_current_score_div();
	var tune = get_tune(div);
	var music = clean_music(get_music(tune));
	view_resource(music);
}

function on_download_score() {
	var div = get_current_score_div();
	var tune = get_tune(div);
	var music = clean_music(get_music(tune));
	var a = document.getElementById("download_score");
	a.href = "data:data/abc;charset=UTF-8," + encodeURIComponent(music);
	a.setAttribute("download", data.textID + "_Score.abc");
}

function update_presentation_divs(tryno) {
	var musicWidth = 0;
	var maxMusicHeight = 0;
	var headerHeight = 0;

	var div = document.getElementById("v0");
	var v = 0;
	while (div != null) {
        var svgs = div.getElementsByTagName("svg");
		svgs[0].style.display = NONE; // hide header
        var music_rect = svgs[1].getBoundingClientRect();
        var gs = div.getElementsByTagName("g");
        var g_rect = gs[0].getBoundingClientRect();
		if (music_rect.width == 0 || g_rect.width == 0) {
			if (tryno == null || tryno < 200) {
				console.log("update_presentation_divs try " + tryno);
				setTimeout(update_presentation_divs, 5, ((tryno == null) ? 1 : tryno + 1));
				return;
			}
		}
		if (headerHeight == 0) {
			headerHeight = svgs[0].getBoundingClientRect().height;
		}
        var width = g_rect.x * 2 + g_rect.width;
		var viewbox = "0 0 " + Math.ceil(width) + " " + svgs[1].getAttribute("viewBox").split(" ")[3];
		svgs[1].setAttribute("viewBox", viewbox);
		svgs[1].setAttribute("width", width);
		musicWidth += width;
		div.style.width = width + "px"
        div.style.height = music_rect.height + "px";
		maxMusicHeight = Math.max(maxMusicHeight, music_rect.height);
	    v++;
	    div = document.getElementById("v" + v);
    }
	
	var scale = (Math.min(window.innerHeight, window.innerWidth) - 200) / maxMusicHeight;
	if (scale < 1) {
		scale = 1;
	}
	
	Present_main.style.height = (window.innerHeight - 32) + "px";
	Present_main.style.width = musicWidth + "px";
	
	div = document.getElementById("v0");
	v = 0;
	while (div != null) {
		var height = parseInt(div.style.height.replace("px", ""));
		var y = (height - headerHeight / 2 - maxMusicHeight * 2) / 2;
		div.style.transform = "translateY(" + y + "px) scale(1," + scale + ") translateY(" + (window.innerHeight / scale / 2) + "px)";
	    v++;
	    div = document.getElementById("v" + v);
    }
	Present_main.style.transform = "translateX(" + (-musicWidth / 2) + "px) scale(" + scale + ",1) translateX(" + (musicWidth / 2) + "px)";
	
	Present_header.getElementsByTagName("span")[0].style.fontSize = (12 * scale) + "pt";
	Present_header.style.height = (48 * scale / 3 + 12) + "px";
	rect = Present_footer.getBoundingClientRect();
	Present_footer.style.top = (window.innerHeight - rect.bottom + rect.top - 25) + "px";
}

function breaksOrSpacingChanged() {
	var boob = document.getElementById("break_only_on_bars");
	var fsbw = document.getElementById("force_space_between_words");
	var mbas = document.getElementById("manage_breaks_and_spacing");
	if (window.event) {
		if (window.event.target == mbas) {
			opts.manageBreaksAndSpacing = mbas.checked;
			if (opts.manageBreaksAndSpacing) {
				opts.breakOnlyOnBars = (Best_layout.indexOf("bar") >= 0);
				opts.forceSpaceBetweenWords = (Best_layout.indexOf("padded") >= 0);
				boob.checked = opts.breakOnlyOnBars;
				fsbw.checked = opts.forceSpaceBetweenWords;
			} else {
				opts.breakOnlyOnBars = boob.checked;
				opts.forceSpaceBetweenWords = fsbw.checked;
			}
		} else if (window.event.target == boob) {
			opts.breakOnlyOnBars = boob.checked;
		} else if (window.event.target == fsbw) {
			opts.forceSpaceBetweenWords = fsbw.checked;
		}
	}
	boob.disabled = opts.manageBreaksAndSpacing;
	fsbw.disabled = opts.manageBreaksAndSpacing;
	document.getElementById(boob.id + "_label").className = (opts.manageBreaksAndSpacing ? "disabled_control" : "");
	document.getElementById(fsbw.id + "_label").className = (opts.manageBreaksAndSpacing ? "disabled_control" : "");
	updateView();
}

function changeTempo(amount) {
	tempo += amount;
	Tempo_value.textContent = tempo;
	if (abcplay) {
		abcplay.set_speed(tempo / data.music_fields[TEMPO][0]);
	}
}

function resetMusic() {
	playing = false;
	noSleep.disable();
	//if (wakelock != null) {
	//  wakelock.release().then(() => {wakelock = null; Trigram.style.backgroundColor = ""});
	//}
	abc2svg.playsection(null);
	Play_pause_resume.value = "Play";
	document.getElementById("play_pause_resume_link").textContent = "Play";
	document.getElementById("mobile_menu").style.display = NONE;
	abc2svg.tune_index_playing = null;
	abc2svg.verse_playing = null;
	abc2svg.follow_speed = null;
	window.scroll(0,0);
}

function calc_follow_speed() {
	return Math.max((240 - tempo) / 10, 5);
}

function calc_plan() {
	maxLetter = "A";
	for (var i = 0; i < data.stanzas.length; i++) {
		var keys = Object.keys(data.stanzas[i].map);
		for (var j = 0; j < keys.length; j++) {
			if (keys[j].charAt(0).toUpperCase() > maxLetter) {
				maxLetter = keys[j].charAt(0).toUpperCase();
			}
		}
	}
	plan = "@" + maxLetter + "1";
	for (var i = 1; i <= data.verseCount; i++) {
		if (opts.versesShown[i] == IN_SCORE || opts.versesShown[i] == AFTER_SCORE) {
			plan += ";" + i;
		}
	}
	return plan;
}

function play() {
	abc2svg.playsection(null);
	abc2svg.last_location = null;
	if (View == PRESENTATION) {
		abc2svg.follow_speed = calc_follow_speed();
	} else {
		abc2svg.follow_speed = null;
	}
	playing = true;
	noSleep.enable();
	//if ("wakeLock" in navigator) {
	//  navigator.wakeLock.request("screen").then((lock) => {wakelock = lock; Trigram.style.backgroundColor = "red"});
	//}
	plan_remaining = opts.performancePlan;
	if (plan_remaining == null) {
		if (data.text_fields["Road Map"] != null) {
			plan_remaining = data.text_fields["Road Map"][0];
		} else {
			plan_remaining = calc_plan();
		}
	}
	play_next();
	Play_pause_resume.value = "Pause";
}

function pause() {
	playing = false;
	abc2svg.follow_speed = null;
	abc2svg.playsection(null);
	noSleep.disable();
	//if (wakelock != null) {
	//  wakelock.release().then(() => {wakelock = null; Trigram.style.backgroundColor = ""});
	//}
	Play_pause_resume.value = "Resume";
}

function resume() {
	if (abc2svg.last_location != null) {
		abc2svg.playsection(null);
		if (View == PRESENTATION) {
			abc2svg.follow_speed = calc_follow_speed();
		} else {
			abc2svg.follow_speed = null;
		}
		var div = document.getElementById(View == PRESENTATION ? "v" + abc2svg.verse_playing : "score_view_main");
		var start_svg = div.getElementsByClassName('_' + abc2svg.last_location + '_')[0];
		abc2svg.last_location = null;
		playing = true;
		noSleep.enable();
		//if ("wakeLock" in navigator) {
		//  navigator.wakeLock.request("screen").then((lock) => {wakelock = lock; Trigram.style.backgroundColor = "red"});
		//}
		abc2svg.playsection(start_svg, end_svg, schedule_play_next);
		Play_pause_resume.value = "Pause";
	}
}

function play_pause_resume() {
	if (Play_pause_resume.value == "Play") {
		play();
	} else if (Play_pause_resume.value == "Resume") {
		resume();
	} else if (Play_pause_resume.value == "Pause") {
		pause();
	}
	document.getElementById("play_pause_resume_link").textContent = Play_pause_resume.value;
	document.getElementById("mobile_menu").style.display = NONE;
	if (window.event) {
		window.event.preventDefault();
	}
}

function reset_tune_verse(tune, verse) {
	abc2svg.init_tune(tune);

	if (data.ties != null || data.rests != null) {
		for (var sym = abc2svg.abc.tunes[tune][0]; sym.ts_next != null; sym = sym.ts_next) {
			if (sym.istart != null) {
				var code = abc2svg.codes[tune]["abcr" + sym.istart];
				if (code != null && data.rests != null && data.rests[code] != null) {
					var turn_on = (verse != null && data.rests[code][verse]);
					sym.noplay = turn_on;
					next_s = sym.ts_next;
					while (next_s.type == sym.type && next_s.time == sym.time) {
						next_s.noplay = turn_on;
						next_s = next_s.ts_next;
					}
				} else if (code != null && data.ties != null && data.ties[code] != null) {
					var turn_on = (verse != null && data.ties[code][verse]);
					//console.log("tie at " + code + " " + "next=ts_next: " + (sym.next == sym.ts_next));
					/*if (code.toUpperCase() == "A4") {
						console.log("tie at " + code + " " + "next=ts_next: " + (sym.next == sym.ts_next));
						console.log("sym: " + sym.istart + " notes: " + (sym.notes ? sym.notes.length : ""));
						console.log("sym.next: " + sym.next.istart + " notes: " + (sym.next.notes ? sym.next.notes.length : ""));
						console.log("sym.next.next: " + sym.next.next.istart + " notes: " + (sym.next.next.notes ? sym.next.next.notes.length : ""));
						console.log("sym.next.ts_next: " + sym.next.ts_next.istart + " notes: " + (sym.next.ts_next.notes ? sym.next.ts_next.notes.length : ""));
						console.log("sym.ts_next: " + sym.ts_next.istart + " notes: " + (sym.ts_next.notes ? sym.ts_next.notes.length : ""));
						console.log("sym.ts_next.next: " + sym.ts_next.next.istart + " notes: " + (sym.ts_next.next.notes ? sym.ts_next.next.notes.length : ""));
						console.log("sym.ts_next.ts_next: " + sym.ts_next.ts_next.istart + " notes: " + (sym.ts_next.ts_next.notes ? sym.ts_next.ts_next.notes.length : ""));
					}*/
					var sign = 0;
					if (turn_on && sym.o_dur == null) {
						sign = 1;
					} else if (!turn_on && sym.o_dur != null) {
						sign = -1;
					} else {
						continue;
					}
					if (sign > 0) {
						sym.o_dur = sym.dur;
						sym.o_pdur = sym.pdur;
					}
					var tied = sym.next;
					sym.dur += sign * tied.dur;
					sym.pdur += sign * tied.dur / sym.o_dur * sym.o_pdur ;
					var next_tied_s = tied;
					while (next_tied_s.type == tied.type && next_tied_s.time == tied.time) {
						var same_pitch = false;
						for (var i = 0; i < sym.notes.length; i++) {
							for (var j = 0; j < next_tied_s.notes.length; j++) {
								same_pitch = true;
								break;
							}
						}
						next_tied_s.noplay = (turn_on && same_pitch);
						next_tied_s = next_tied_s.ts_next;
					}
					next_s = sym.ts_next;
					while (next_s.type == sym.type && next_s.time == sym.time) {
						next_s.dur += sign * tied.dur;
						next_s.pdur += sign * tied.dur / sym.o_dur * sym.o_pdur;
						next_s = next_s.ts_next;
					}
					if (sign < 0) {
						sym.o_dur = null;
						sym.o_pdur = null;
					}
				}
			}
		}
	}
}

function play_next() {
	//var mystarttime = Date.now();
	nextPlayStepScheduled = false;
	if (!playing) {
		return;
	}
	if (plan_remaining.length == 0) {
		resetMusic();
		return;
	}
	//if (part_playing != null) {
	//  document.getElementById("lbl" + part_playing).style.fontWeight = "normal";
	//}
	var part_name = null;
	var part = plan_remaining;
	var semicolon = plan_remaining.indexOf(";");
	if (semicolon > 0) {
		part = plan_remaining.substring(0, semicolon);
		plan_remaining = plan_remaining.substring(semicolon + 1);
	} else {
		plan_remaining = "";
	}
	var colon = part.indexOf(":");
	if (colon > 0) {
		part_name = part.substring(0, colon);
		part = part.substring(colon + 1);
	}
	var verse = 0;
	var start_code = null;
	var end_code = null;
	var at = part.indexOf("@");
	abc2svg.skip_repeats = (at == 0);
	if (at > 0) {
		verse = parseInt(part.substring(0,at));
	}
	if (at >= 0) {
		part = part.substring(at + 1);
		var dash = part.indexOf("-");
		if (dash > 0) {
			start_code = part.substring(0, dash);
			end_code = part.substring(dash + 1);
		} else {
			start_code = part;
		}
	} else {
		verse = parseInt(part);
	}

	var div = null;
	if (View == PRESENTATION) {
		div = document.getElementById("v" + verse);
	} else {
		div = get_current_score_div();
		/*
		var divs = document.getElementsByClassName("score_option");
		for (var i = 0; i < divs.length; i++) {
			if (divs[i].style.display == BLOCK) {
				div = divs[i];
				break;
			}
		}
		*/
	}
	var tune = get_tune(div);
	abc2svg.tune_index_playing = tune;
	abc2svg.verse_playing = verse;
	//abc2svg.pause_after_tune = 25;
	reset_tune_verse(tune, verse);
	
	//console.log("mystarttime: " + (Date.now() - mystarttime));
	var start_rect = null; //abc2svg.abc.tunes[tune][0];
	var end_rect = null;
	if (start_code != null) {
		if (abc2svg.codes[tune] == null) {
			console.log("no codes");
		}
		if (abc2svg.codes[tune] != null) {
			var keys = Object.keys(abc2svg.codes[tune]);
			for (var i = 0; i < keys.length; i++) {
				if (start_code != null) {
					if (abc2svg.codes[tune][keys[i]] == start_code) {
						var rects = div.getElementsByClassName("abcr _" + keys[i].substring(4) + "_");
						if (rects.length == 1) {
							start_rect = rects[0];
						}
					}
				}
				if (end_code != null) {
					if (abc2svg.codes[tune][keys[i]] == end_code) {
						var rects = div.getElementsByClassName("abcr _" + keys[i].substring(4) + "_");
						if (rects.length == 1) {
							end_rect = rects[0];
						}
					}
				}
				if ((start_code == null || start_rect != null) && (end_code == null || end_rect != null)) {
					break;
				}
			}
		}
		if (start_rect == null) {
			plan_remaining = "";
		}
	}
	/*
	if (start_rect == null) {
		for (var sym = abc2svg.abc.tunes[tune][0]; sym.ts_next != null; sym = sym.ts_next) {
			if (sym.type == 8 && sym.istart != null) {
				start_rect = div.getElementsByClassName("abcr _" + sym.istart + "_")[0];
				plan_remaining = "";
				break;
			}
		}
	}
	*/
	end_svg = end_rect;
	if (start_rect == null) {
		abc2svg.playsection(div.getElementsByTagName("svg")[1], null, schedule_play_next);
	} else {
		abc2svg.playsection(start_rect, end_rect, schedule_play_next);
	}
}

function partCbClicked(e) {
  if (e.target.id.substr(0,3) == 'cbV') {
    document.getElementById("v" + e.target.id.substr(3)).style.display = (e.target.checked ? INLINE_BLOCK : NONE);
  }
}

function schedule_play_next() {
  if (!nextPlayStepScheduled) {
	nextPlayStepScheduled = true;
	setTimeout(play_next, 0);
  }
}
