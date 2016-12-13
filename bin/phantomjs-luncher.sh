#!/bin/bash

phantom=$1
cookie=$2
conveter=$3
params=$4

# exécution du phantomJS avec les paramètres pour la création d'un PDF
runPhantomJS() {
	echo `${phantom} ${cookie} ${conveter} ${params} 2> $1`
	`rm $1`
	exit 0
}

# Analyse le fichier de log générer par phantomJS
getPhantomJsStatus(){
	# TODO voir une autre solution pour eviter le waiter
	sleep 8
	#TODO récupérer que la sortie standar
	res=`cat $1|grep -a "updateLoadingProgress: 90"|head -n 1|rev|cut -d ' ' -f 1|rev`
	echo "$res"
}

# fonction permet de lancer phantomJS, le relancer ou cas de plantage
# attention cette fonction est récursive
# aucun arguments en entrée
main () {

	if [ $1 -gt 5 ]; then
		exit 0
	fi

	random=$(date +%s)
	LOGFILE="/tmp/$random.log"
	runPhantomJS ${LOGFILE} &
	pid=$!

	result=$(getPhantomJsStatus ${LOGFILE})

	if [ "$result" != "90" ]; then
		pkill=`pkill phantomjs > /dev/null 2>&1`
		returned=`echo $?`
		# limiter la récursivité à 5 fois
		if [ "$returned" = 0 ]; then
			let "count = $1 + 1"
		    main ${count}
        fi
	fi
	wait ${pid}

}

# appel de la foncton main

main 0
