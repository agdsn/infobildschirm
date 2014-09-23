/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <timklge@wh2.tu-dresden.de> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return - Tim Kluge
 * ---------------------------------------------------------------------------
 * */

translateTime = function(x){ return x; }

// Default module display duration in seconds
var defaultmodduration = translateTime(12000);

// Default data update interval in seconds
var updateinterval = 60;

var alreadyshown = false;

// Available modules and updating information (StateMachine).
// One module should consist of exactly one impress.js-step with the given id.
// {"id": {"time": XX, "oninit": func, "onshow": func, "onhide": func, "onbeforeshow": func},...}
// Event parameters: module-object {"id": ..., "cache": {}, "time": ...}, matched data object (data["id"])
var modules = {
	"intro": {
        onshow: function(obj, data){
            if(alreadyshown) console.log("renderingfinished");
            alreadyshown = true;
        }
    },
	
	"traffic": {"time": defaultmodduration*1.5,
		oninit: function(obj, data){
			for(var i = 0; i < Object.keys(data.nodes).length; i++){
				var key = Object.keys(data.nodes)[i];
				if(key == "Uplink-Weberplatz") continue;
				
				var a = i / Object.keys(data.nodes).length * 360 * Math.PI / 180;
				var x = (250 + 200 + Math.cos(a) * 400);
				var y = (250 + 140 + Math.sin(a) * 350);
				if(!obj.cache[key]) obj.cache[key] = {};
				obj.cache[key].x = x; obj.cache[key].y = y;
				$("#N_" + key).css({"left": x + "px", "top": y + "px"});
			}
		},
		
		onbeforeshow: function(obj, data){
			var totaltraffic = data.links["Uplink-Weberplatz"]["in"] + data.links["Uplink-Weberplatz"]["out"];
			
			$.each(data.nodes, function(node, nodedata){
				// Calculate maximum size of dormitory nodes - max 900 pixels if full bandwidth is used
				var targetd = Math.round((nodedata["in"] + nodedata["out"]) / totaltraffic * 900);
				
				// Size has to be between 60 and 220
				if(targetd < 60) targetd = 60;
				if(targetd > 220) targetd = 220;
				
				// Move node a little bit
				$("#N_" + node).animate({left: (obj.cache[node]["x"] + Math.round(-50 + Math.random() * 100)) + "px",
					top: (obj.cache[node]["y"] + Math.round(-50 + Math.random() * 100)) + "px"},
					{easing: "linear", duration: translateTime(10000)});
					
				// Resize node to newly calculated size targetd within 5 seconds
				var n = Math.round(Math.random() * 200);
				$("#N_" + node + "_K").animate({height: targetd + "px", 
					width: targetd + "px",
					"border-radius": Math.round(targetd / 2) + "px"}, {easing: "easeInOutSine", duration: translateTime(1000)});
				$("#N_" + node).animate({
					"margin-left": Math.round(-targetd / 4) + "px",
					"margin-top": Math.round(-targetd / 4) + "px"},
					{easing: "easeInOutSine", duration: translateTime(1000)});	
					
				// Resize node's container to avoid graphical glichtes (chrome doesn't redraw overflowed content)
				$("#N_" + node).css({width: targetd + "px",
					height: (targetd + 50) + "px"});
					
				// Show current traffic on the node's label
				$("#N_" + node + "_C").html(node + "<br /><span class='traflabel'>" +
					Math.round(nodedata["in"] / 1000 / 1000 + nodedata["out"] / 1000 / 1000) + " MB/s</span>").animate({width: targetd + "px"}, {easing: "easeInOutSine", duration: translateTime(1000)});
			});
			
			// Show total traffic in the tiny cloud 
			var inb = data.links["Uplink-Weberplatz"]["in"] / 1000 / 1000;
			var outb = data.links["Uplink-Weberplatz"]["out"] / 1000 / 1000;
			var max = 1000 * 1000 * 1000 / (100 / 8);
			$("#internetztraf").html("D: " + Math.round(inb) + " MB/s - U: " + Math.round(outb) + " MB/s - " + Math.round((inb + outb) * 1000 * 1000 / max * 100) + " %");
		}},
		
	"news1": {
		onbeforeshow: function(obj){
			if(data["news"][0] && data["news"][0].title && data["news"][0].text){
				$("#news1").html("<h1>" + data["news"][0].title + "</h1>" + data["news"][0].text);
			}
		}},
		
	"news2": {
		onbeforeshow: function(obj){
			if(data["news"][1] && data["news"][1].title && data["news"][1].text){
				$("#news2").html("<h1>" + data["news"][1].title + "</h1>" + data["news"][1].text);
			}
		}},
		
	"vvo": {"time": defaultmodduration*1.5,
		oninit: function(obj, data){
			$("#buscontent").hide();
		},
		
		onshow: function(obj, data){
			// Prepare style to feature departure board
			$("body").animate({"background-color": "#231401"}, {"duration": translateTime(250)});
			$("#logo").fadeOut(translateTime(250));
			$("#logo_black").fadeIn(translateTime(250));
			$("#buscontent").fadeIn(translateTime(250));
			
			var s = '', row = 0, rowh = 45;
			data["Zellescher Weg"].forEach(function(data){
				s += '<div style="position: absolute; left: 25px; top: ' + (row * rowh + 10) + 'px;">' + data.line + '</div>';
				s += '<div style="position: absolute; left: 120px; top: ' + (row * rowh + 10) + 'px;">' + data.direction + '</div>';
				s += '<div style="position: absolute; left: 500px; top: ' + (row * rowh + 10) + 'px;">' + data.time + '</div>';
				row += 1;
			});
			row = 0;
			data["Wasaplatz"].forEach(function(data){
				s += '<div style="position: absolute; left: 610px; top: ' + (row * rowh + 10) + 'px;">' + data.line + '</div>';
				s += '<div style="position: absolute; left: 730px; top: ' + (row * rowh + 10) + 'px;">' + data.direction + '</div>';
				s += '<div style="position: absolute; left: 1110px; top: ' + (row * rowh + 10) + 'px;"">' + data.time + '</div>';
				row += 1;
			});
			$("#bus_table").html(s);
		},
		
		onhide: function(obj, data){
			$("#buscontent").fadeOut(translateTime(100));
			$("body").animate({"color": "#002", "background-color": "white"}, {"duration": translateTime(100)});
		}},
		
	"mensawu1": {"time": defaultmodduration*1.5,
		onbeforeshow: function(obj){
			$("#mensawu1").animate({"color": "#002"});
			
			var s = '<tr><th class="mensatabltd" style="width: 200px;"><img id="wu1img" src="mensa-wueins.png" width="200"></th>' +
				'<th class="mensatabltd" width="500"><h2>Heute</h2></th><th class="mensatabltd" width="200"> </th></tr>';
			var meals = data.mensa["Mensa WUeins"];
			
			$.each(meals.today, function(ind, meal){
				s += "<tr><td style='border-bottom: solid 1px black; border-right: solid 1px black;'></td>";
				s += "<td style='border-bottom: solid 1px black; border-right: solid 1px black;'>" + meal.title + "</td><td align='right' style='border-bottom: solid 1px black;'><i>" + meal.price + "</i></td>";
				s += "</tr>";
			});
			
			s += "<tr><td class='mensatabltd' border-right: solid 1px black;'></td>";
			s += "<td class='mensatabltd' width='500'><h2>Morgen</h2></td><td style='border-bottom: solid 1px black;'> </td></tr>";
			
			$.each(meals.tomorrow, function(ind, meal){
				s += "<tr><td style='border-bottom: solid 1px black; border-right: solid 1px black;'></td>";
				s += "<td style='border-bottom: solid 1px black; border-right: solid 1px black;'>" + meal.title + "</td><td align='right' style='border-bottom: solid 1px black;'><i>" + meal.price + "</i></td>";
				s += "</tr>";
			});
			
			$("#mensawu1angebot").html(s);
		},
		
		onshow: function(obj, data){
			$("#mensacontent").slideDown(translateTime(100));
		},
		
		onhide: function(obj, data){
			$("#mensacontent").fadeOut(translateTime(100));
			$("body").animate({"background-color": "#002", "color": "white"}, {"duration": translateTime(100)});
			$("#logo_black").fadeOut(translateTime(100));
			$("#logo").fadeIn(translateTime(100));
			$("#wu1img").fadeOut(translateTime(200));
		}},
		
	"userstat": {
		onbeforeshow: function(obj, data){
			$("#userstat").animate({"color": "white"});
			var ctx = $("#userstatpie").get(0).getContext("2d");
			ctx.clearRect(0, 0, 1000, 1000);
			var s = "", i = 0;
			var colors = ["darkturquoise", "darkcyan", "darkmagenta", "goldenrod", "darkslateblue", "grey", "green"];
			$.each(data.dormitories, function(dorm, dd){
				s += '<div class="userstatlegend" style="background-color: ' + colors[i] + '"></div><strong>' + dd["ok"] + '</strong>: ' + dorm + '<br />';
				i++;
			});
			s += '<div class="userstatlegend" style="background-color: red;"></div><strong>' + data["notok"] + '</strong>: Gesperrt<br />';
			s += '<div class="userstatlegend" style="background-color: black;"></div><strong>' + data["email"] + '</strong>: Benutzt nur E-Mail</div>';
			$("#userstattabl").html(s);
		},
		
		onshow: function(obj, data){
    		var ctx = $("#userstatpie").get(0).getContext("2d");
    		var options = {animateScale : false, animationEasing: "easeInOutQuart", animationSteps : translateTime(200), segmentStrokeColor : "#fff"};
    		var chartdata = [{value: data["notok"], color: "red"}, 
    			{value: data["email"], color: "rgb(0, 0, 0)"}];
    		var colors = ["darkturquoise", "darkcyan", "darkmagenta", "goldenrod", "darkslateblue", "grey", "green"];
    		var i = 0;
    		$.each(data.dormitories, function(dorm, dd){
    			chartdata.push({value: dd["ok"], color: colors[i]});
    			i++;
    		});
    		chart = new Chart(ctx).Pie(chartdata, options);	
		},
		
		onhide: function(obj, data){
			stopRendering();
		}}
};

/*
 * ----------------------------------------------------------------------------
 * It should not be neccessary to edit the file after this line.
 * ----------------------------------------------------------------------------
 * */

// Current data provided by server. Update every 30 seconds.
var data = {};

// Used to access the impress.js-api
var impressapi = undefined;

// Set up data update timer
function updateData(cb){
	
	// Use demo data
	
	data = {"vvo": {"Zellescher Weg": [{"line": "61", "direction": "L\u00f6btau", "time": 0}, {"line": "11", "direction": "B\u00fchlau", "time": 1}, {"line": "61", "direction": "Fernsehturm", "time": 2}, {"line": "11", "direction": "Gorbitz", "time": 4}, {"line": "11", "direction": "Zschertnitz", "time": 6}, {"line": "11", "direction": "Zschertnitz", "time": 9}, {"line": "11", "direction": "B\u00fchlau", "time": 11}, {"line": "61", "direction": "Fernsehturm", "time": 12}, {"line": "61", "direction": "L\u00f6btau", "time": 12}, {"line": "11", "direction": "Zschertnitz", "time": 17}], "Wasaplatz": [{"line": "61", "direction": "Btf. Gruna", "time": 0}, {"line": "9", "direction": "Prohlis", "time": 0}, {"line": "EV9/13", "direction": "9/13 Prohlis", "time": 1}, {"line": "75", "direction": "Goppeln", "time": 1}, {"line": "13", "direction": "Mickten", "time": 2}, {"line": "63", "direction": "L\u00f6btau", "time": 2}, {"line": "9", "direction": "Kaditz", "time": 3}, {"line": "85", "direction": "Striesen", "time": 5}, {"line": "85", "direction": "L\u00f6btau S\u00fcd", "time": 5}, {"line": "61", "direction": "Fernsehturm", "time": 5}]}, "news": [{"text": "<p>Die AG DSN, Sektion Wundtstra\u00dfe hat einen neuen Vorstand gew\u00e4hlt:</p>\n<pre>\nVorsitzender                    Dominik Pataky\nStellv. Vorsitzender            Felix Kluge\nFinanzer                        Felix Wollert\nHardwareverantwortlicher        Maximilian Marx\n\u00d6ffentlichkeitsarbeit           Axel Rothe</pre>", "title": "Neuer Vorstand 2013"}, {"text": "<p>Durch das Aktualisieren der Software auf den Hausswitches kam und kommt es heute zu kurzzeitigen Netzausf\u00e4llen.</p>", "title": "Switchupdates"}, {"text": "<p>Am Dienstag, den 29.10.2013 zwischen 17:30 und 21:00 ist auf Grund der Installation von Sicherheitsupdates mit Netzausf\u00e4llen zu rechnen.</p>", "title": "Netzausf\u00e4lle am 29.10.2013"}, {"text": "<p>Es wird wieder einmal Zeit f\u00fcr den neuen Semestermitgliedsbeitrag in H\u00f6he von 15 EUR.</p>\n<p>Bareinzahlungen sind bei uns nicht m\u00f6glich!</p>\n<p><b>Bei Neuanmeldungen, die nach dem 01.09.2013 erfolgten, bei denen der Semesterbeitrag schon entrichtet wurde, ist keine erneute Zahlung von N\u00f6ten!</b></p>\n<p>Die \u00dcberweisung ist wie folgt auszuf\u00fcllen:</p>\n<table border=\"0\" cellspacing=\"1\" width=\"100%\">\n<tr class=\"odd\">\n<td>Beg\u00fcnstigter</td>\n<td>Studentenrat TUD - AG DSN</td>\n</tr>\n<tr class=\"odd\">\n<td>Kontonr.:</td>\n<td>3120219540</td>\n</tr>\n<tr class=\"odd\">\n<td>BLZ:</td>\n<td>85050300</td>\n</tr>\n<tr class=\"odd\">\n<td>IBAN:</td>\n<td>DE61850503003120219540 (Nur bei Auslands\u00fcberweisungen)</td>\n</tr>\n<tr class=\"odd\">\n<td>BIC-/SWIFT-CODE</td>\n<td>OSDD DE 81 XXX (Nur bei Auslands\u00fcberweisungen)</td>\n</tr>\n<tr class=\"odd\">\n<td>Betrag:</td>\n<td><b>15,00 EUR (evtl. zuz\u00fcglich 2,50 EUR Vers\u00e4umnisgeb\u00fchr)</b></td>\n</tr>\n<tr class=\"odd\">\n<td>Verwendungszweck:</td>\n<td>Nutzer_id, Nachname, Vorname, Wohnheim / ZimmerNr, WS 13/14</td>\n</tr>\n</table>\n<p>Die <b>Nutzer_id</b> findest du bei den Daten auf deinem Mitgliedsantrag oder auf der <a href=\"https://www.wh2.tu-dresden.de/de/usertraffic/\">Trafficseite</a> im oberen Bereich der Seite.</p>\n<p>Bitte \u00fcberweist das Geld <b>bis sp\u00e4testens 01.11.2013</b> - wer zu sp\u00e4t kommt wird gesperrt! Nachzahler m\u00fcssen eine zus\u00e4tzlichen Bearbeitungsgeb\u00fchr von 2,50 EUR zahlen. Sobald euer Geld dann eingetroffen ist, werdet ihr automatisch wieder freigeschaltet.</p>\n<p>Bitte seht von Nachfragen ob euer Geld angekommen ist ab, bei der Menge an \u00dcberweisungen behalten wir den \u00dcberblick nur mit Hilfe eines automatisierten Systems und unserer Datenbank und es entsteht durch die Nachfragen ein erheblicher Mehraufwand.</p>\n<p>Ein Nachweis der erfolgten \u00dcberweisung (nur g\u00fcltige Kontoausz\u00fcge, keine \u00dcberweisungstr\u00e4ger) muss <b>erst dann</b> erbracht werden, wenn ihr nachweislich wegen Nicht-bezahlens gesperrt worden seid.</p>", "title": "Semesterbeitrag"}, {"text": "<p>Die Firma Microsoft hat angek\u00fcndigt ab dem <strong>8. Aprill 2014</strong> die Herstellerunterst\u00fctzung f\u00fcr das Betriebssystem Windows XP zu beenden. Ab diesem Zeitpunkt werden daf\u00fcr keine Sicherheitsupdates mehr erscheinen. Es wird daher Windows XP Nutzern dringend dazu geraten bis sp\u00e4testens dahin auf ein aktuelleres Betriebssystem zu wechseln oder PCs mit Windows XP keinen Internetzugang mehr zu gew\u00e4hren.</p>\n<p>Alternativ kann nat\u00fcrlich auch auf Ubuntu oder eine andere Linux Distribution gewechselt werden. Ihr findet dazu einiges bei uns im Downloadbereich:</p>\n<p><a href=\"https://www.wh2.tu-dresden.de/de/download\" title=\"https://www.wh2.tu-dresden.de/de/download\">https://www.wh2.tu-dresden.de/de/download</a></p>", "title": "Windows XP n\u00e4chstes Jahr ohne Sicherheitsupdates"}, {"text": "<p>Am <strong>Dienstag, den 01.10.2013 ab 10:00 Uhr</strong> gibt es eine zus\u00e4tzliche Sprechstunde wegen des Semesterbegins!</p>", "title": "Zus\u00e4tzliche Sprechstunde"}, {"text": "<p>Die Sprechstunden in der Ferienzeit sind wie gewohnt&nbsp;</p>\n<p><strong>Montag 19-20 Uhr</strong> und <strong>Donnerstag 19-20 Uhr</strong> im B\u00fcro Wu5 Erdgeschoss.</p>", "title": "Sprechstunde in den Semesterferien"}, {"text": "<p>Die aktiven Mitglieder der AGDSN haben in langer Arbeit eine neue Satzung entworfen, da die bestehende durch Altlasten und fehlende Regelungen nicht mehr zeitgem\u00e4\u00df ist. Der Entwurf kann unter der Seite <a href=\"https://www.wh2.tu-dresden.de/de/node/488\">Satzungsentwurf</a> eingesehen werden.</p>\n<p>Zur Verabschiedung der Satzung durch die aktiven Mitglieder findet am 19.08.2013 um 18:00 Uhr eine \u00f6ffentliche Vollversammlung im AGDSN-B\u00fcro der Hochschulstra\u00dfe statt. Auch alle nicht-aktiven Mitglieder sind herzlich eingeladen!</p>", "title": "Vollversammlung und Neue Satzung"}, {"text": "<p>Das Trafficlimit wurde nach den letzten Verhandlungen mit dem ZIH erh\u00f6ht, es stehen jetzt 14GB/Woche zur Verf\u00fcgung, also doppelt so viel wie bisher.</p>\n<p>Die Trafficplugins zeigen nun - im Gegensatz zu den letzten drei Tagen - auch wieder die korrekten Werte an.</p>", "title": "Trafficlimit-Erh\u00f6hung"}, {"text": "<h2 style=\"font-size: 9pt;\">Das Studentenwerk teilt mit:</h2>\n<pre style=\"font-size: 9pt;\"><tt>am Wochenende wurden bei einem Einbruch in das Hausmeisterb\u00fcro Schl\u00fcssel \nentwendet.\nUm zu verhindern, dass unberechtigte Personen Zugang zum Haus haben, werden am \nheutigen Nachmittag (24.06.2013) die Schl\u00f6sser der Eingangst\u00fcren ausgetauscht.\nMit Ihrem jetzigen Schl\u00fcssel kommen Sie somit nicht mehr in das Wohnheim hinein!\nZur Gew\u00e4hrung der Sicherheit werden bis auf weiteres Zugangskontrollen durch \nMitarbeiter der Sicherheitsfirma \"DWSI\" durchgef\u00fchrt, die Ihnen als Mieter nur \nnach entsprechender Legitimation Zugang gew\u00e4hren.\nIn Ihrem eigenen Interesse empfehlen wir Ihnen dringend, die Zimmert\u00fcren \ninsbesondere nachts von innen zu verschlie\u00dfen und den Schl\u00fcssel stecken zu \nlassen.\nIn den n\u00e4chsten Tagen werden auch die Schl\u00f6sser der WG-T\u00fcren getauscht. Jeder \nMieter erh\u00e4lt dann einen neuen Haust\u00fcr- und WG-Schl\u00fcssel.\n\nWir bedauern diese Umst\u00e4nde nat\u00fcrlich sehr, bedanken uns f\u00fcr Ihr Verst\u00e4ndnis und \nm\u00f6chten gleichzeitig alle Mieter zu erh\u00f6hter Wachsamkeit in und um den Zellschen \nWeg aufrufen.</tt></pre>", "title": "Einbruch ins Hausmeisterb\u00fcro Zellescher Weg"}], "userstat": {"dormitories": {"Wundtstrasse 1": {"ok": 201, "violation": 1, "notpaid": 0, "traffic": 2, "notok": 3, "total": 211, "email": 7}, "Wundtstrasse 3": {"ok": 204, "violation": 0, "notpaid": 1, "traffic": 2, "notok": 3, "total": 213, "email": 6}, "Wundtstrasse 5": {"ok": 214, "violation": 4, "notpaid": 0, "traffic": 2, "notok": 6, "total": 228, "email": 8}, "Wundtstrasse 7": {"ok": 208, "violation": 0, "notpaid": 0, "traffic": 4, "notok": 4, "total": 217, "email": 5}, "Wundtstrasse 9": {"ok": 215, "violation": 0, "notpaid": 0, "traffic": 2, "notok": 2, "total": 221, "email": 4}, "Zellescher Weg": {"ok": 274, "violation": 0, "notpaid": 0, "notok": 1, "traffic": 1, "total": 307, "email": 32}, "Wundtstrasse 11": {"ok": 221, "violation": 0, "notpaid": 0, "traffic": 2, "notok": 2, "total": 231, "email": 8}}, "ok": 1537, "notok": 21, "total": 1628, "email": 70}, "traffic": {"nodes": {"Wu3": {"out": 9999983, "in": 1952694}, "Wu1": {"out": 2917397, "in": 321134}, "Wu7": {"out": 2452538, "in": 609533}, "Wu5": {"out": 20549218, "in": 4008966}, "Wu9": {"out": 1920981, "in": 431218}, "Wu11": {"out": 2620529, "in": 1618185}, "ZW": {"out": 4499003, "in": 722658}}, "links": {"Wu7-Link": {"out": 2452538, "in": 609533}, "Wu5-Link": {"out": 20549218, "in": 4008966}, "ZW-Link": {"out": 4499003, "in": 722658}, "Wu1-Link": {"out": 2917397, "in": 321134}, "Wu9-Link": {"out": 1920981, "in": 431218}, "Wu3-Link": {"out": 9999983, "in": 1952694}, "Wu11-Link": {"out": 2620529, "in": 1618185}, "Uplink-Weberplatz": {"out": 11240646, "in": 48105690}}}, "mensa": {"Mensa TellerRandt": {"tomorrow": [{"price": "2.30 / 3.95 EUR", "title": "Rostbratwurst mit Sauerkraut und Stampfkartoffeln "}, {"title": "Frischk\u00e4se-Kr\u00e4uterso\u00dfe"}, {"price": "1.80 / 3.45 EUR", "title": "Kr\u00e4uterquark mit Leberwurst und Petersilienkartoffeln "}], "today": [{"title": "Tomatenso\u044fe"}, {"title": "Hamburger mit Pommes frites (ausverkauft)"}, {"price": "3.00 / 4.65 EUR", "title": "Rinderschmortopf Stifado mit Silberzwiebeln, Rosinen und Rotwein, dazu Rosmarinkartoffeln "}, {"title": "Spinat- Rahmso\u044fe"}, {"title": "Bunte Gem\u044csesuppe mit Ei"}]}, "Mensa WUeins": {"tomorrow": [{"price": "2.32 / 3.97 EUR", "title": "Seelachs gef\u00fcllt mit Broccoli und K\u00e4se, dazu Kartoffelp\u00fcree "}, {"price": "2.00 / 3.65 EUR", "title": "Hausgemachte frische Pasta mit K\u00e4se-Pistazienso\u00dfe "}], "today": [{"price": "2.54 / 4.19 EUR", "title": "Schweineschnitzel Toscana mit herzhafter Kr\u0434uter-Parmesanpanade, dazu scharfe Tomatensalsa und Petersilienkartoffeln "}, {"price": "2.28 / 3.93 EUR", "title": "Paprikaschote gef\u044cllt mit Soja, Zwiebeln und Paprika, dazu fruchtige Tomatenso\u044fe und Kurkumareis "}]}, "Mensologie": {"tomorrow": [{"price": "1.95 / 3.60 EUR", "title": "S\u00e4chsische Kartoffelsuppe mit  W\u00fcrstchen dazu Brot "}, {"price": "2.35 / 4.00 EUR", "title": "Vegetarisches Schnitzel mit K\u00e4sef\u00fcllung dazu Nudelsalat und Salatgarnitur "}, {"price": "3.61 / 5.26 EUR", "title": "Wok und Pfanne: Gebackener Fischspie\u00df dazu Remouladenso\u00dfe, Tomatensalat und Pommes frites "}, {"price": "2.40 / 4.05 EUR", "title": "Angebot im GOURMED: Hausgemachte Pasta mit Bacon und Pinienkernen in Rahm, oder Tomatenso\u00dfe "}], "today": [{"price": "2.00 / 3.65 EUR", "title": "Fr\u044chlingsrolle mit asiatischem Gem\u044cse und Basmatireis "}, {"price": "2.25 / 3.90 EUR", "title": "Bratwurst mit Sauerkraut und Kartoffelp\u044cree "}, {"title": "Wok und Pfanne: Bl\u0434tterteigtasche gef\u044cllt mit Hirtenk\u0434se und Spinat auf Tomaten-Olivenragout dazu Salat (ausverkauft)"}, {"title": "Angebot im GOURMED: Rindergulasch mit Gem\u044csesp\u0434tzle (ausverkauft)"}]}, "Mensa Stimm-Gabel": {"tomorrow": [{"price": "2.32 / 3.97 EUR", "title": "Seelachs gef\u00fcllt mit Broccoli und K\u00e4se, dazu Kartoffelp\u00fcree "}, {"price": "2.00 / 3.65 EUR", "title": "Hausgemachte frische Pasta mit K\u00e4se-Pistazienso\u00dfe "}], "today": [{"price": "2.54 / 4.19 EUR", "title": "Schweineschnitzel Toscana mit herzhafter Kr\u0434uter-Parmesanpanade, dazu scharfe Tomatensalsa und Petersilienkartoffeln "}, {"price": "2.28 / 3.93 EUR", "title": "Paprikaschote gef\u044cllt mit Soja, Zwiebeln und Paprika, dazu fruchtige Tomatenso\u044fe und Kurkumareis "}]}, "Mensa Johannstadt": {"tomorrow": [{"price": "2.40 / 4.05 EUR", "title": "Herzhafte Kohlroulade mit Schmorkraut und Petersilienkartoffeln "}, {"price": "2.60 / 4.25 EUR", "title": "Hausgemachte Antipasti mit Gnocchi und Basilikumso\u00dfe "}, {"price": "1.81 / 2.86 EUR", "title": "Beeren Pizza mit N\u00fcssen "}, {"price": "3.23 / 4.88 EUR", "title": "H\u00e4hnchenbrustfilet gef\u00fcllt mit Schinken und K\u00e4se, dazu eine Grilltomate und kleine Salbeikartoffeln "}], "today": [{"price": "2.40 / 4.05 EUR", "title": "Schupfnudel-Pfanne mit Kasslerstreifen und buntem Gem\u044cse "}, {"price": "2.00 / 3.65 EUR", "title": "Krautnudeln mit Salami, dazu Tomatenso\u044fe und K\u0434se auch veg. Ohne Fleisch "}, {"price": "3.23 / 4.88 EUR", "title": "Saltimbocca vom Buntbarsch auf buntem Gem\u044csebett mit Mie Nudeln "}, {"title": "Pizza mit Grillgem\u044cse oder Pizza Currywurst (ausverkauft)"}]}, "Mensa G\u0446rlitz": {"tomorrow": [], "today": [{"price": "2.40 / 4.05 EUR", "title": "Schweiner\u044cckensteak mit Wurst-Zwiebel-Paprikaso\u044fe, dazu Country Kartoffeln und bunter Wei\u044fkohlsalat "}, {"price": "1.95 / 3.60 EUR", "title": "Buntes Eierragout, dazu Romanesco und Petersilienkartoffeln "}, {"price": "2.75 / 4.40 EUR", "title": "Marinierter Hering nach Hausfrauen Art, dazu Salzkartoffeln und Rote Bete Salat "}]}, "Mensa Kreuzgymnasium": {"tomorrow": [{"price": "2.95 / 3.25 EUR", "title": "S\u00e4chsische Kartoffelsuppe mit  W\u00fcrstchen dazu Brot "}, {"price": "2.95 / 3.25 EUR", "title": "Vegetarisches Schnitzel mit K\u00e4sef\u00fcllung dazu Nudelsalat und Salatgarnitur "}], "today": [{"price": "2.95 / 3.25 EUR", "title": "Fr\u044chlingsrolle mit asiatischem Gem\u044cse und Basmatireis "}, {"price": "2.95 / 3.25 EUR", "title": "Bratwurst mit Sauerkraut und Kartoffelp\u044cree "}]}, "Mensa Br\u044chl": {"tomorrow": [], "today": [{"price": "2.54 / 4.19 EUR", "title": "Schweineschnitzel Toscana mit herzhafter Kr\u0434uter-Parmesanpanade, dazu scharfe Tomatensalsa und Petersilienkartoffeln "}, {"price": "2.28 / 3.93 EUR", "title": "Paprikaschote gef\u044cllt mit Soja, Zwiebeln und Paprika, dazu fruchtige Tomatenso\u044fe und Kurkumareis "}]}, "Mensa Siedepunkt": {"tomorrow": [{"price": "1.99 / 3.64 EUR", "title": "Bayrischer Fleischk\u00e4se mit s\u00fc\u00dfen oder mittelscharfen Senf, dazu Bratkartoffeln und bunter Wei\u00dfkrautsalat "}, {"price": "2.20 / 3.85 EUR", "title": "Hausgemachte frische Pasta mit Olivenpesto, dazu gehobelten Parmesan "}, {"price": "3.10 / 4.75 EUR", "title": "XXL Burger mit Pommes frites "}, {"price": "2.99 / 4.64 EUR", "title": "Abendangebot: Hackfleischspie\u00df oder Gem\u00fcsespie\u00df, dazu Letschoso\u00dfe, Pommes Twister und Salat "}], "today": [{"price": "1.45 / 3.10 EUR", "title": "Drei Quarkk\u0434ulchen mit Puderzucker und Apfelmus "}, {"title": "Kartoffelr\u0446sti mit Gem\u044cse gratiniert, dazu fruchtiger Fitnesssalat (ausverkauft)"}, {"price": "2.65 / 4.30 EUR", "title": "Schweinebraten mit Sommergem\u044cse, dazu wahlweise Petersilienkartoffeln oder Kartoffelkroketten "}, {"price": "2.85 / 4.50 EUR", "title": "Abendangebot: Pizza Funghi mit Champignons, Zwiebeln und Mais oder Pizza mit Kochschinken und Lauch oder Pizza Gyros mit Schweinefleisch, Zwiebeln, Paprika und Tsatsiki, dazu Salat "}]}, "Mensa Haus VII": {"tomorrow": [{"price": "2.70 / 4.35 EUR", "title": "W\u00fcrziger Gulasch vom Rind mit Rauchwurst, dazu Butterbohnen und Kl\u00f6\u00dfe "}, {"price": "2.20 / 3.85 EUR", "title": "Gem\u00fcse-Vollkornbratling mit Joghurt-Dip, dazu Schwenkkartoffeln und ein bunter Salat "}], "today": [{"price": "2.40 / 4.05 EUR", "title": "Schweiner\u044cckensteak mit Wurst-Zwiebel-Paprikaso\u044fe, dazu Bratkartoffeln und bunter Wei\u044fkohlsalat "}, {"price": "1.95 / 3.60 EUR", "title": "Buntes Eierragout, dazu Romanesco und Petersilienkartoffeln "}]}, "Mensa Palucca Hochschule": {"tomorrow": [{"price": "1.95 / 3.60 EUR", "title": "S\u00e4chsische Kartoffelsuppe mit  W\u00fcrstchen dazu Brot "}, {"price": "2.35 / 4.00 EUR", "title": "Vegetarisches Schnitzel mit K\u00e4sef\u00fcllung dazu Nudelsalat und Salatgarnitur "}], "today": [{"price": "2.00 / 3.65 EUR", "title": "Fr\u044chlingsrolle mit asiatischem Gem\u044cse und Basmatireis "}, {"price": "2.25 / 3.90 EUR", "title": "Bratwurst mit Sauerkraut und Kartoffelp\u044cree "}]}, "Neue Mensa": {"tomorrow": [{"price": "2.89 / 4.54 EUR", "title": "Marinierte H\u00e4hnchenbrust mit Peperonata und hausgemachter frischer Pasta "}, {"price": "2.32 / 3.97 EUR", "title": "Seelachs gef\u00fcllt mit Broccoli und K\u00e4se, dazu Kartoffelp\u00fcree "}, {"price": "2.99 / 4.64 EUR", "title": "Aktionstheke: Hamburger mit gebratenem Fleischk\u00e4se, dazu Pommes frites "}, {"title": "Pasta: Hackfleisch-Zucchiniso\u00dfe"}, {"title": "Pasta: K\u00e4se-Pistazienso\u00dfe"}, {"price": "1.33 / 2.38 EUR", "title": "Fit & Vital: Ofenkartoffel mit Kr\u00e4uterquark-Dip oder veganem Kr\u00e4uter-Dip "}, {"price": "1.24 / 2.29 EUR", "title": "Fit & Vital: Seelachsfilet mit Champignons gratiniert "}, {"price": "1.84 / 2.89 EUR", "title": "Fit & Vital: Austernpilzschnitzelchen an Soja-Kr\u00e4uter-Dip "}, {"price": "2.49 / 4.14 EUR", "title": "Fit & Vital Komplettangebot: Soja-Currygeschnetzeltes mit Kr\u00e4uterreis und Salat "}, {"title": "Fit & Vital: Bl\u00e4tterteigstrudel mit Spinat, Hirtenk\u00e4se und getrockneten Tomaten (ausverkauft)"}, {"title": "OMeGa-Suppenbar: Fruchtige Tomatensuppe"}, {"title": "OMeGa-Suppenbar: Ungarische Gulaschsuppe"}, {"title": "OMeGa-Suppenbar: Br\u00fchgr\u00e4upchen mit Kassler und Kohlrabi"}, {"title": "OMeGa-Suppenbar: Lauchcremesuppe"}, {"title": "OMeGa-Suppenbar: Mango-K\u00fcrbissuppe"}, {"title": "OMeGa-Suppenbar: Deftiger Bohneneintopf mit Knackwurst"}, {"title": "Pasta: Fruchtige Tomatenso\u00dfe"}], "today": [{"price": "2.49 / 4.14 EUR", "title": "Paprikaschote gef\u044cllt mit Schweinefleisch und Hirtenk\u0434se, dazu fruchtige Tomatenso\u044fe und Kurkumareis "}, {"title": "Pasta: Gorgonzola-Spinatso\u044fe"}, {"price": "3.61 / 5.26 EUR", "title": "Aktionstheke: Entenbruststreifen mit WOK - Gem\u044cse dazu Mie Nudeln "}, {"title": "Pasta: Soja-Bolognese"}, {"price": "1.99 / 3.64 EUR", "title": "Schweineschnitzel mit Zitronenecke und Kartoffelchips "}, {"price": "1.33 / 2.38 EUR", "title": "Fit & Vital: Ofenkartoffel mit Kr\u0434uterquark-Dip oder veganem Kr\u0434uter-Dip "}, {"price": "1.24 / 2.29 EUR", "title": "Fit & Vital: Seelachsfilet mit Champignons gratiniert "}, {"price": "1.84 / 2.89 EUR", "title": "Fit & Vital: Austernpilzschnitzelchen an Soja-Kr\u0434uter-Dip "}, {"price": "2.49 / 4.14 EUR", "title": "Fit & Vital Komplettangebot: Soja-Currygeschnetzeltes mit Kr\u0434uterreis und Salat "}, {"title": "Fit & Vital: Bl\u0434tterteigstrudel mit Spinat, Hirtenk\u0434se und getrockneten Tomaten (ausverkauft)"}, {"title": "OMeGa-Suppenbar: Fruchtige Tomatensuppe"}, {"title": "OMeGa-Suppenbar: Ungarische Gulaschsuppe"}, {"title": "OMeGa-Suppenbar: Br\u044chgr\u0434upchen mit Kassler und Kohlrabi"}, {"title": "OMeGa-Suppenbar: Lauchcremesuppe"}, {"title": "OMeGa-Suppenbar: Mango-K\u044crbissuppe"}, {"title": "OMeGa-Suppenbar: Deftiger Bohneneintopf mit Knackwurst"}, {"title": "Pasta: Fruchtige Tomatenso\u044fe"}]}, "Mensa Sport": {"tomorrow": [{"price": "3.20 / 3.70 EUR", "title": "S\u00e4chsische Kartoffelsuppe mit  W\u00fcrstchen, dazu Brot "}, {"price": "3.20 / 3.70 EUR", "title": "Vegetarisches Schnitzel mit K\u00e4sef\u00fcllung, dazu Nudelsalat und Salatgarnitur "}, {"price": "3.20 / 3.70 EUR", "title": "Pasta: H\u00e4hnchenkeule mit Rotkohl, Salzkartoffeln "}], "today": [{"price": "3.20 / 3.70 EUR", "title": "Fr\u044chlingsrolle mit asiatischem Gem\u044cse und Basmati Reis "}, {"price": "3.20 / 3.70 EUR", "title": "Bratwurst mit Sauerkraut und Kartoffelp\u044cree "}, {"price": "3.20 / 3.70 EUR", "title": "Pasta: Makkaroni mit Wurstgulasch, Reibek\u0434se "}]}, "BioMensa U-Boot": {"tomorrow": [{"price": "2.80 / 4.45 EUR", "title": "Kaiserschmarrn mit Apfelmus "}, {"price": "4.40 / 6.05 EUR", "title": "Pizza in verschiedenen Sorten, mit und ohne Fleisch "}], "today": [{"price": "3.90 / 5.55 EUR", "title": "Indonesisches Wokgem\u044cse mit Schweinefleisch, Erdn\u044cssen und Pfirsichen, dazu Reisnudeln "}, {"price": "2.90 / 4.55 EUR", "title": "Indonesisches Wokgem\u044cse mit Erdn\u044cssen und Pfirsichen, dazu Reisnudeln "}, {"price": "2.40 / 2.40 EUR", "title": "Vegane Blumenkohlrahmsuppe "}]}, "Mensa Br\u00fchl": {"tomorrow": [{"price": "2.32 / 3.97 EUR", "title": "Seelachs gef\u00fcllt mit Broccoli und K\u00e4se, dazu Kartoffelp\u00fcree "}, {"price": "2.00 / 3.65 EUR", "title": "Hausgemachte frische Pasta mit K\u00e4se-Pistazienso\u00dfe "}], "today": []}, "Mensa Reichenbachstra\u044fe": {"tomorrow": [], "today": [{"price": "3.23 / 4.88 EUR", "title": "GA T XAO CARI DO - Zartes Putenfleisch mit buntem Wokgem\u044cse, dazu Reisnudeln "}, {"title": "Ungarische H\u0434hnchenpfanne mit Erbsengem\u044cse und Kr\u0434uterreis (ausverkauft)"}, {"price": "1.96 / 3.61 EUR", "title": "Kartoffelpuffer G\u0434rtnerin Art mit Kr\u0434uterquarkdip oder Apfelmus "}, {"price": "3.23 / 4.88 EUR", "title": "Schweinekammsteak Lugano mit Schwarzwurzelrahmgem\u044cse und Kartoffelkroketten "}, {"title": "Pasta-Theke: Hackfleisch-K\u0434seso\u044fe mit Lauch"}, {"title": "Pasta-Theke: Tomatenrahmso\u044fe"}, {"title": "Suppenstation: Gulaschsuppe"}, {"title": "Suppenstation: Champignon-Lauchcremesuppe"}, {"title": "Asia-Theke: Heute geschlossen, bitte besuchen Sie f\u044cr dieses Angebot unsere Ausgabe im Erdgeschoss. Guten Appetit"}]}, "Alte Mensa": {"tomorrow": [{"price": "1.80 / 3.45 EUR", "title": "Krautnudeln mit Salami und Salat "}, {"title": "Pasta: Ajvar-Olivenso\u00dfe"}, {"title": "Pasta: Tomatenrahmso\u00dfe"}, {"price": "3.42 / 5.07 EUR", "title": "Wok & Grill: Gebackene H\u00e4hnchenbrust mit knackigem Wokgem\u00fcse und Mie Nudeln "}, {"price": "2.30 / 3.95 EUR", "title": "Mit Hackfleisch gef\u00fcllte Paprikaschote in Tomatenso\u00dfe, dazu Erbsen-Maisgem\u00fcse und Reis "}, {"price": "2.50 / 4.15 EUR", "title": "Falafel-Burger mit scharfer Tomatensalsa und Pommes frites "}, {"title": "Pizza Gyros mit Schweinefleisch, Zwiebeln, Paprika und Tsatsiki"}, {"price": "1.90 / 2.95 EUR", "title": "Auflauf: Gyros-Reispfanne mit Pilzso\u00dfe gratiniert "}], "today": [{"price": "2.09 / 3.74 EUR", "title": "Wok & Grill: Schweinsmedaillons Provence mit Oliven und Schinken "}, {"price": "2.35 / 4.00 EUR", "title": "Currywurst Thai Style mit Pommes frites "}, {"price": "1.80 / 3.45 EUR", "title": "Milchgrie\u044f mit Zimtzucker und Sauerkirschen "}, {"title": "Pasta: Wurstgulasch"}, {"title": "Pasta: K\u0434seso\u044fe Quattro formaggi"}, {"title": "Pizza Gyros mit Schweinefleisch, Zwiebeln, Paprika und Tsatsiki"}, {"price": "1.90 / 2.95 EUR", "title": "Auflauf: Gyros-Reispfanne mit Pilzso\u044fe gratiniert "}]}, "Mensa G\u00f6rlitz": {"tomorrow": [{"price": "2.20 / 3.85 EUR", "title": "Gem\u00fcse-Vollkornbratling mit Joghurt-Dip, dazu Pommes frites und ein bunter Salat "}, {"price": "2.70 / 4.35 EUR", "title": "W\u00fcrziger Gulasch vom Rind mit Rauchwurst, dazu Butterbohnen und Kl\u00f6\u00dfe "}, {"price": "2.15 / 3.80 EUR", "title": "Pizzaschnitte mit Salami, Zwiebel, Peperoni, Rucola und K\u00e4se \u00fcberbacken "}], "today": []}, "Mensa Reichenbachstra\u00dfe": {"tomorrow": [{"title": "Asia-Theke: Heute geschlossen, bitte besuchen Sie f\u00fcr dieses Angebot unsere Ausgabe im Erdgeschoss. Guten Appetit"}, {"price": "2.85 / 4.50 EUR", "title": "Vegeteran: LON XAO MAGI - Schweinefleisch mit buntem Wokgem\u00fcse , dazu Basmati Reis "}, {"price": "2.34 / 3.99 EUR", "title": "Zwiebelsteak mit Bratkartoffeln "}, {"price": "1.99 / 3.64 EUR", "title": "J\u00e4gerschnitzel mit Karotten Erbsengem\u00fcse und Petersilienkartoffeln "}, {"price": "2.57 / 3.62 EUR", "title": "Pizza Day: Tonno mit Thunfisch, Zwiebeln oder Caprese mit Tomaten, Basilikum und Mozzarella "}], "today": []}, "Mensa Zittau": {"tomorrow": [{"price": "3.30 / 4.95 EUR", "title": "Schweiner\u00fcckensteak mit W\u00fcrzfleisch und K\u00e4se \u00fcberbacken, dazu buntes Gem\u00fcse und Pommes frites "}, {"price": "2.70 / 4.35 EUR", "title": "W\u00fcrziger Gulasch vom Rind mit Rauchwurst, dazu Butterbohnen und Kl\u00f6\u00dfe "}, {"price": "2.20 / 3.85 EUR", "title": "Gem\u00fcse-Vollkornbratling mit Joghurt-Dip, dazu Pommes frites und ein bunter Salat "}, {"price": "2.60 / 4.25 EUR", "title": "Kippelinge (Seelachsst\u00fccke im Backteig) mit buntem Kartoffelsalat "}], "today": [{"price": "3.05 / 4.70 EUR", "title": "Rindergeschnetzeltes aus dem Wok mit Mu err Pilzen, Broccoli und Zwiebel, dazu Basmati Reis "}, {"price": "2.40 / 4.05 EUR", "title": "Schweiner\u044cckensteak mit Wurst-Zwiebel-Paprikaso\u044fe, dazu Country Kartoffeln und bunter Wei\u044fkohlsalat "}, {"price": "1.95 / 3.60 EUR", "title": "Buntes Eierragout, dazu Romanesco und Petersilienkartoffeln "}, {"price": "1.55 / 3.20 EUR", "title": "S\u044c\u044fer Quarkauflauf mit Aprikosen und Kirschen "}]}}};
	cb();
	return;
	
	$.getJSON("data.json", function(r){
		data = r;
		if(cb) cb();
	});
}
setInterval(updateData, updateinterval * 1000);

// Set up clock timer
function updateClock(){
	var date = new Date();
	var month = ["Januar", "Februar", "M&auml;rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"][date.getMonth()];
	var day = date.getDate();
	var wday = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"][date.getDay()];
	var hour = date.getHours() + ""; if(hour.length < 2) hour = "0" + hour;
	var minutes = date.getMinutes() + ""; if(minutes.length < 2) minutes = "0" + minutes;
	var seconds = date.getSeconds() + ""; if(seconds.length < 2) seconds = "0" + seconds;
	var s = wday + ", " + day + ". " + month + " " + (1900 + date.getYear()); // + " " + hour + ":" + minutes + ":" + seconds + " Uhr";
	$("#clock").html(s);
}
setInterval(updateClock, 1000);

// Initialize stuff and modules on initialization
document.addEventListener("impress:init", function (event) {
	impressapi = event.detail.api;
	updateClock();
	
	$("#ajaxfail").hide();
	$("#logo_black").hide();
	
	$(document).ajaxError(function(err){
		$("#ajaxfail").show();
	});
	
	// Update data before initializing modules to 
	updateData(function(){
		// Initialize modules
		$.each(modules, function(id, obj){
			obj["id"] = id;
			obj["cache"] = {};
			if(obj["oninit"]) obj["oninit"](obj, data[id]);
		});
	});
	
	setTimeout(startRendering, 100);
});

// Process step enter events
document.addEventListener("impress:stepenter", function (event) {
    // Get ID of new module
    var target = event.target.id;
    
    var mod = modules[target];
    if(mod.onshow) mod.onshow(mod, data[target]);
    
    setTimeout(function(){
		impressapi.next();
	}, mod.time ? mod.time : defaultmodduration);
});

// Process step leave events and beforeshow events
document.addEventListener("impress:stepleave", function (event) {
	// Get ID of last module
	var target = event.target.id;
	
	var mod = modules[target];
	if(mod.onhide) mod.onhide(mod, data[target]);
	
	// Dunno whether javascript object value order
	// is guaranteed to stay the same in current engines
	var nextmodindex = (Object.keys(modules).indexOf(target) + 1) %
		Object.keys(modules).length;
	var nexttarget = Object.keys(modules)[nextmodindex];
	var nextmod = modules[nexttarget];
	
	if(nextmod.onbeforeshow) nextmod.onbeforeshow(nextmod, data[nexttarget]);
});

// Initialize impress.js-framework (fires "impress:init" callback)
impress().init();
