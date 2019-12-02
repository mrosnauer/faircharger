#Blockchain Projekt: Faircharger

##Matrickelnummern

- 4622546
- 8019500
- 5704145


##Idee

Mit dem steigenden Verlangen nach mehr Elektromobilität stellt die Bevölkerung hohe Anforderungen an die Infrastruktur. Hierzu muss in Zukunft ausreichendviele Ladesäulen aufgestellt werden, um die Elektrofahrzeuge mit Strom zu versorgen. Der Aufbau vieler Ladesäulen ist mit viel Geld verbunden, was nicht jeder Staat tragen kann. Hierzu kommt die Idee des „Fairchargers“ in spiel. 
Die Idee des Fairchargers sieht vor, jedem Bürger die Möglichkeit zu überlassen, selber eine Ladesäule zu errichten. Hierzu können diese eine Wandladestation kaufen. Elektrofahrzeuge können diese Station zum Laden nutzen. Gleich wie bei einer Tankstelle wird der Betrag für die geladenen Kilowattstunden vom Konto des Elektrofahrzeuginhabers abgebucht und auf das Konto des Ladesäuleninhabers übertragen. Der Preis für die Kilowattstunde ist wird hierbei vom Ladesäuleninhaber vorgegeben. 
Durch die Idee des Fairchargers wird das Infrastrukturproblem für Elektroautos minimiert und bietet eine weitere Möglichkeit für Privatpersonen Geld zu verdienen. Das abwickeln der Transaktionen wird hierbei über eine Blockchain abgearbeitet. 

##Ablauf 
Wenn eine Person mit seinem Elektrofahrzeug an eine Ladesäule kommt kann er den Code, der auf jeder Ladesäule zur Identifikation stehen muss, in eine App eingeben. Über diesen Code wird der Preis für die Kilowattstunde abgefragt. Nach der Abfrage wird der Preis auf dem Handy des Fahrzeugbesitzers angezeigt. Dieser kann daraufhin bestätigen, falls dieser Laden will oder nicht. Wenn dieser akzeptiert wird über Payment Channels die Transaktion abgewickelt. Der Ablauf wird in Abbildung 1 skizziert dargestellt.

[./DokuBilder/Ablauf Faircharger.png](some image)

Abbildung 1: Ablauf des Fairchargers


##Technischer Ablauf
Der technische Ablauf des Fairchargers ist in Abbildung 2 zu erkennen. Sobald der Fahrer des Elektrofahrzeuges den Code der Ladesäule in seine App eingegeben hat, wird ein /GET-Request eine Anfrage an die Datenbank gestellt. Diese liefert über die Response den Preis und die Accountdaten der eingegebenen Ladesäule zurück. Dieser Preis wird daraufhin in der App des Fahrers angezeigt. Nachdem dieser den Preis akzeptiert wird ein Payment Channel aufgebaut. Der Payment Channel soll hierbei das Problem der Vor- bzw. Danach-Zahlung lösen. Bei diesen werden nur signierte Zahlungen versendet, die vorerst nicht auf der Blockchain zusammengefügt werden. Die Zahlungen werden dabei alle KilowattStunden pro 5 Sekunden abgerechnet. Die genaue Beschreibung zu Payment Channels steht in dem Kapitel „Payment Channels“. Nachdem der Ladevorgang abgeschlossen wurde wird der Payment Channel geschlossen und alle bis dahin überwiesene Zahlungen werden final auf der Blockchain zusammengeführt. 


[./DokuBilder/technischer Ablauf.png](some image)

Abbildung 2: Technischer Ablauf


##Payment Channels 
Bei der Implementierung des Fairchargers werden Payment Channels benutzt. Payment Channels sind off-chain Payment Networks, die es erlauben mehrere Transaktionen als eine Zusammenzufassen. Durch die Zusammenfassung werden viele Transaktionskosten, was der Hauptvorteil der Payment Channels darstellt. Zudem ermöglichen Payment Channels durch die Bündelung eine schnellere und private Transaktion. 
Für den Faircharger werden hierbei unidirektionale Payment Channels verwendet, daher beschränken wir uns auf dies. 

###Funktion   
Bei unidirektionalen Payment Channels legt der Sender einen Smart Contract aus und öffnet hierdurch den Payment Channel zwischen ihm und einem Empfänger. Danach sendet der Sender mehrere „signed Payments“, mit einem festgelegten Betrag an den Empfänger. Die signed Payments werden hierbei nicht über die Chain an den Empfänger gesendet, sondern laufen über ein eigenes Netzwerk. Dadurch müssen die Transaktionen vorerst nicht auf der Blockchain zusammengeführt werden. Nachdem der Empfänger alle nötigen Transaktionen erhalten hat, schließt dieser den Payment Channel. Daraufhin werden alle bis dahin gesendeten signed Payments auf der Blockchain als eine Transaktion zusammengeführt. Hierdurch wird die Privatsphäre geschützt, da keine Historie aus den Transaktionen herausgefunden werden kann, da nur die finale Bilanz zusammengeführt wird. Des Weiteren wird durch das nur einmalige Zusammenführen eine Schnelligkeit der Transaktionen geboten. In Abbildung XY sieht man hierzu die passende Darstellung des Aufbaus, Verlaufs und Abschluss eines Payment Channels. 

 [./DokuBilder/payment.png](some image)
 
Abbildung 3: Payment Channels

##Warum dieser Aufbau? 
Dieser Aufbau wurde gewählt, da er viele Vorteile aufweist. Im Folgenden sind die Vorteile aufgelistet: 
•     Bezahlungsproblem wird durch Payment Channel gelöst
•    Fahrer kann nicht wegfahren, ohne zu bezahlen
•    Ladesäulenbesitzer kann nicht die Bezahlung kassieren und keinen Strom ausgeben
•    Sicherheit für den Elektro-Fahrer und Ladesäulen-Besitzer
•    Sofortiger Abbruch des Ladevorgangs, falls keine Zahlungen mehr eintreffen
•    Sofortiger Abbruch der Zahlungen, falls der Ladevorgang unterbrochen wird
•    Der Ladesäulenbesitzer kann den Preis variabel festlegen
•    Ladesäule ist direkt mit dem Account des Besitzers verbunden
•    Elektrofahrer kann bestimmen wie viel Geld er ausgeben möchte 
Hindernisse bei der Implementierung
Bei der Implementierung dieses Projekts sind wir auf Schwierigkeiten bzw. Hindernisse gestoßen. Ein großes Hindernis war hierbei die Payment Channels zu implementieren bzw. zu testen. Diese waren zu Beginn schwierig zu verstehen bzw. komplex zu implementieren, obwohl es hierbei viele Beispiel aus dem Internet gibt. 
Des Weiteren gab es Schwierigkeiten, passende Tests für die Smart Contracts und die Payment Channels zu schreiben. 

##Probleme der Architektur 
Das Problem mit dieser Architektur besteht in den Payment Channels. Diese können in unserer Architektur nur vom Empfänger geschlossen werden. Dass bedeutet, dass der Empfänger jeden Abend in seine Transaktionen schauen muss, um sich das Geld für diesen Tag abzuholen. Zudem bedeutet das, dass der Sender immer einen ausreichend großen Timeout setzten muss, sodass die Transaktionen nicht wieder zurückgerufen werden. 
Des Weiteren besteht ein Problem bei der Bezahlung durch die Payment Channel. Bei diesen stellte sich heraus, dass jede Transaktion bestätigt werden muss. Dies führt durch die hohe Anzahl an Transaktionen zu nicht nutzerfreundlichen Aufgabe. Deshalb müsste für dieses Problem in der realen Umsetzung des Fairchargers eine Lösung gefunden werden.  




##Ist eine Blockchain notwendig?
Das Bezahlen ist ein grundlegendes Problem des Fairchargers. Bei einer normalen Bezahlabwicklung, bei dem gezahlt wird nachdem das Gut transferiert wurde, besteht bei dem Projekt des Fairchargers das Problem, dass der Elektrofahrzeugbesitzer wegfahren könnte, ohne den Besitzer der Ladesäule zu bezahlen. Bei einer normalen Bezahlabwicklung, bei dem im Voraus gezahlt wird, besteht das Problem, dass hierbei der Ladesäulenbesitzer den Elektrofahrer kein Strom geben könnte. 
Deshalb wurde für dieses Projekt Payment Channels angelegt, die dieses Problem minimieren. Die Payment Channels sorgen dafür, dass der Ladesäulenbesitzer kontinuierlich Geld von dem Elektrofahrer bekommt. Hierdurch ist gesichert, dass der Fahrer nach dem Laden nicht einfach wegfahren kann, ohne zu bezahlen. Des Weiteren ist durch die Payment Channels abgesichert, dass der Fahrer die Bezahlungen abbrechen kann, wenn dieser bemerkt, wenn dieser kein Strom erhält. Durch eine normale Bezahlung musste dieser Vorgang auf Vertrauensbasis ablaufen, was im realen Leben nicht möglich ist. 
Zudem ist durch die Blockchain eine gewisse Anonymität der Fahrer und Empfänger gewährleistet, da man die Kaufhistorie nicht sieht, sondern nur den Endpreis. 

##Fazit
Faircharger ist ein Projekt, dass mithilfe einer Blockchain das Ladesäulenproblem beheben soll und nebenbei noch ein Verdienst für die Anbieter darstellt. Eine Blockchain wurde hierbei verwendet, um über Payment Channels Zahlungen einfach und fair abwickeln zu können. Faires abwickeln bedeutet in diesem Zusammenhang, dass sowohl der Fahrer als auch der Ladesäulenbesitzer nicht durch boshafte Absichten des Anderen „übers Ohr gehauen“ werden kann. Zudem sorgt der Payment Channel dafür, dass wenige zusätzliche Kosten durch das Zusammenführen der Transaktionen auf der Blockchain entstehen. Falls bei der Zahlung keine Blockchain verwendet werden würde, müsste sowohl der Fahrer als auch der Ladesäulenbesitzer darauf vertrauen, dass dieser Strom bzw. Geld im Gegenzug für den geladenen Strom erhalten. 




