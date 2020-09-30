"use strict";
var btnBack = document.getElementById('BACK');
var button = document.getElementById("btn");
var intro = document.getElementById('Content');
var contentBells = document.getElementById('NON');
var vinilConteiner = document.getElementById('VIN');
var divControls = document.getElementById('CONTROLS');
var btnRec = document.getElementById('RECBTN');
var noPlay = document.getElementById('STOP')
var zvukElem=document.getElementById('ZVUK');
var btnSaveMusic = document.getElementById('btnSave')
var recordBlock = document.getElementById('RECORDBLOCK')
var SPAState={};
var context;
var pass = Math.random();
// история о нотах и их длительностях
var storige = {bells: []};
var imgPlay = document.getElementById('PLAY1');
var imgStop = document.getElementById('STOP');
var recordSpan = document.getElementById('RECORDVISIBLE');
var vinil1 = document.getElementById('vinil1');
var listenPlay = document.getElementById('LISTENPLAY');
var log = false;
var logPlayStatus = false;
var  useTouch = false;

window.onhashchange=switchToStateFromURLHash;
window.addEventListener('beforeunload', (EO) => {
    EO=EO||window.event;
    EO.preventDefault();
    EO.returnValue = '';
});

noPlay.addEventListener('click' , stopPlay);


window.addEventListener('touchstart', removeTouch)
function removeTouch() {
    if ('touchstart') {
        useTouch = true;
    }
    document.removeEventListener('touchstart' , removeTouch)
}


class Sound {
    constructor(context) {
        this.context = context;
    }
    init() {  // Осциллятор
        this.oscillator = this.context.createOscillator(); // создаем источник звука
        this.oscillator.type = 'Triangle'; // тип волны источника
        this.gainNode = this.context.createGain(); // создаем gain
        this.oscillator.connect(this.gainNode); // подключаем Осциллятор к Gain
        this.gainNode.connect(this.context.destination); // выводим в аудиовыход
    }
    play(value, time){
        this.init(); // запуск источника
        this.oscillator.frequency.value = value; // задаем тон
        this.gainNode.gain.setValueAtTime(0.3, this.context.currentTime); // gain + длительность

        this.oscillator.start(time);
        this.stop(time);
    }
    stop(time) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.006, time + 2);
        this.oscillator.stop(time + 2); // длительность колебания источника
    }
}
//Запускаем аудиоКонтекст
function startSound() {
    context = new AudioContext();
}

function buildBells(){
    // context = new AudioContext();

    for (let i =0; i<bellsArray.length; i++) {
        let img = document.createElement('img');
        img.src=bellsArray[i].foto;
        img.addEventListener('mouseover',()=>playStatus(bellsArray[i].tone));
        img.addEventListener('touchstart',()=>playStatusM(bellsArray[i].tone));
        img.className="swing";
        contentBells.appendChild(img)
    }
    // bellsArray.map(value => {
    //     var img = document.createElement('img')
    //     img.src=value.foto;
    //     // img.ontouchstart = function(EO){
    //     //     EO=EO||window.event;
    //     //     EO.preventDefault()
    //     //     // if (useTouch){
    //     //         playStatus(value.tone)
    //     //     // }
    //     // }
    //     img.addEventListener('mouseover',()=>playStatus(value.tone));
    //     img.addEventListener('touchstart',()=>playStatus(value.tone));
    //     img.className="swing";
    //     contentBells.appendChild(img)
    // })
}


button.addEventListener('click', go);
function go () {
    buildBells()
    switchToState({pagename:"Bells"})
    intro.className="ContentNON";
    contentBells.className="Content2";
    vinilConteiner.className="vinilConteiner";
    divControls.className="Controls"
    button.removeEventListener('click', go);
    startSound();
    showMusicList()
}

// функция для записи данных при проигрывании
function playRecording (tone) {
    var note = new Sound(context);
    var now = context.currentTime;
    note.play(tone,now)
    var composition  = {when :zvukElem.currentTime, note : tone};
    storige.bells.push(composition)
    note.stop(now)
}
// просто проигрывание тона
function playNote (tone) {
    var note = new Sound(context);
    var now = context.currentTime;
    note.play(tone,now)
    note.stop(now)
}

btnRec.addEventListener('click', recOn);
btnRec.title="Запись"


// статус анимации при клике


function recOn() {
    if (!logPlayStatus){
        storige.bells=[];
        logPlayStatus = true;
        btnRec.className="RecStart";
        recordSpan.className="nonVISIBLE"
        vinilConteiner.className="nonVISIBLE"
        zvukElem.play()
        btnRec.title="Остановить запись"
        listenPlay.disabled="false";
     } else {
        btnRec.title="Запись"
        vinilConteiner.className="vinilConteiner"
        recordSpan.className="inline"
         logPlayStatus = false;
         btnRec.className="Rec"
         zvukElem.pause();
         zvukElem.currentTime=0;
        listenPlay.disabled="";
        checkNotes()
     }
}

//Проверка наличия записи нот в Хэше
// Показ кнопки воспроизведения записи

imgPlay.addEventListener('click' , mainStart)

function checkNotes() {
     if (storige.bells.length === 0) {
         btnSaveMusic.localName="nonVISIBLE";
         alert("Вы не сыграли ни одной ноты, записей нет")
     } else {
         btnSaveMusic.className="btnSave"
         imgPlay.className="playVisible";
         imgStop.className="StopVisible";
     }
}

// статус кнопки записи
function playStatus(tone) {
    if (!logPlayStatus) {
            playNote(tone)
        } else {
            playRecording(tone)
        }

}

function playStatusM(tone) {

    if ( !useTouch ) {
        if (!logPlayStatus) {
            playNote(tone)
        } else {
            playRecording(tone)
        }
    }
}


// проигрывание записи по сохраненным данным
var g =0;
var t;
var t2;
function mainStart() {
    log=true
    buttonCheck()
    btnRec.className="nonVISIBLE"
    imgPlay.className="nonVISIBLE"
    zvukElem.play();
   t2= setTimeout(start,storige.bells[0].when*1000);
}
function start() {
   let firstTime = storige.bells[g].when;
   playNote(storige.bells[g].note);
   g++
   if (g !== storige.bells.length) {
       let secondTime = storige.bells[g].when;
       t = setTimeout(start, secondTime * 1000 - firstTime * 1000) //вычисляем итнервал времени
       console.log(t)
   } else {
       g = 0;
   }
}

function stopPlay() {
    zvukElem.pause();
    zvukElem.currentTime=0;
    if ( t ) { // таймер уже есть?
        clearTimeout(t);
        clearTimeout(t2);
        g=0;
        btnRec.className="Rec"
        imgPlay.className="playVisible"
        log=false;
        buttonCheck()
    }
}

vinil1.addEventListener('click', playMusic);

if (zvukElem.currentTime>83) {
    zvukElem.pause();
    zvukElem.currentTime=0;
}




function playMusic(EO) {
    EO=EO||window.event;
    EO.preventDefault()

    if (!log) {
        zvukElem.play();
        zvukElem.volume=0.5;
        EO.currentTarget.className="animPL"
        recordBlock.className="nonVISIBLE"
        log = true;

    } else {
        zvukElem.pause();
        zvukElem.currentTime=0;
        EO.currentTarget.className="vinil"
        log = false
        recordBlock.className="record"

    }
    buttonCheck()
}
//
// function insertData() {
//     $.ajax("https://fe.it-academy.by/AjaxStringStorage2.php",
//         {
//             type:'POST',
//             dataType:'json',
//             data: {
//                 f:'INSERT',
//                 n: 'Baranov_TheBluesbells',
//                 v: "Привет"
//             },
//             success:dataLoaded,
//             error:errorHandler
//         }
//     );
// }
function readData() {
    $.ajax("https://fe.it-academy.by/AjaxStringStorage2.php",
       {
            type:'POST',
            dataType:'json',
            data: {
                f:'READ',
                n: 'Baranov_TheBluesbells',
            },
            success:parc,
            error:errorHandler
        }

    );
}
// отправка обработанного, готового Хэша
function updateData() {
    $.ajax("https://fe.it-academy.by/AjaxStringStorage2.php",
        {
            type:'POST',
            dataType:'json',
            data: {
                f:'UPDATE',
                n: 'Baranov_TheBluesbells',
                p: pass,
                v: JSON.stringify(melodyStorage.storage)
            },
            success:dataLoaded,
            error:errorHandler
        }
    );
}
function lockgetData() {
    $.ajax("https://fe.it-academy.by/AjaxStringStorage2.php",
        {
            type:'POST',
            dataType:'json',
            data: {
                f:'LOCKGET',
                n: 'Baranov_TheBluesbells',
                p: pass,
            },
            success: function() {
                console.log('success');
                updateData();
            },
            error:errorHandler
        }
    );
}

//
var loaded;
function parc(data) {
    loaded=JSON.parse(data.result);
    console.log('загружены данные через AJAX и сохранено в loaded');
    melodyStorage.storage = loaded;
}

function dataLoaded(data) {
    console.log('загружены данные через AJAX');
    alert('Ваша мелодия успешно сохранилась')
    restart()
}
function errorHandler() {
    alert("ошибка");
}


class MelodyHashClass {
    constructor() {
        this.storage = {};
    }
    addValue (key,value) {
        this.storage[key] = value;
    }
}


window.onload=readData;
function restart() {
      readData();
    showMusicList()
}

var melodyStorage = new MelodyHashClass();
// Сохраняем мелодию
function addMusic() {
    if (storige.bells.length!==0) {
        var userName = prompt("Введите ваше имя:");
        while (userName==="" || userName===null || userName in melodyStorage.storage ){
            if (userName===null){
                return
            }
            if (userName in melodyStorage.storage) {
                userName = prompt('Такое имя уже есть, добавьте несколко символов чтобы сделать его уникальным!')
            }
            if (userName===""){
                userName = prompt("Вы не заполнили поле! Введите имя!")
            }
        }
        var userMelody = storige.bells;
        storige.bells = [];
        melodyStorage.addValue(userName, userMelody);
        lockgetData(melodyStorage.storage) // отправляем на сервер
    }else {
        alert('У вас нет записанной мелодии! Нажмите "REC" и сделайте запись ')
    }
}
   //Показать сохраненный список


function showMusicList() {
    var select = document.getElementById('LIST');
    select.innerHTML="";
    for ( var k in melodyStorage.storage) {
        var txt = 'мелодия пользователя ' + k;
        var op = document.createElement('option');
        op.value=k
        op.innerText=txt;
        select.appendChild(op)
    }
}


function buttonCheck(){
    if(!log)
        listenPlay.disabled="";
    else
        listenPlay.disabled="false";
}
// Проигрываем мелодию пользователя

var log2 = false;
function playMusicUser() {
   log = true;
   log2 = true;
    var option = document.getElementById('LIST')
    var selectedMelodyKey = option.value

    if (selectedMelodyKey) {
        var play = melodyStorage.storage[selectedMelodyKey];
        storige = {
            bells: play
        };
        buttonCheck()
        mainStart()
} else {
        alert('Выберите запись, которую хотите прослушать')
    }
    buttonCheck()
}



function stopUserPlaying() {
    log2 = false;
    log = false;
    stopPlay()
    buttonCheck()
   storige.bells=[];
}


var btnToMusic = document.getElementById('TOMUSIC');
btnToMusic.addEventListener('click', f2)
var save = document.getElementById('SAVE')

function switchToStateFromURLHash() {
    var URLHash = window.location.hash;
    var stateJSON = decodeURIComponent(URLHash.substr(1));

    if (stateJSON!=="")
        SPAState = JSON.parse(stateJSON)
    else
        SPAState = {pagename:'Main'};


    var btnNew = document.getElementById('NEWBTN');
    switch ( SPAState.pagename ) {
        case 'Main':
            intro.className="Content";
            var btnOFF = document.getElementById('btn');
            btnOFF.style.display="none"
            btnNew.className="Start"
            save.className="nonVISIBLE"
            btnNew.addEventListener('click', f2 )
            contentBells.className="nonVISIBLE"
            vinilConteiner.className="nonVISIBLE"
            divControls.className="nonVISIBLE"
            recordBlock.className="nonVISIBLE"

            break;
        case 'Bells':
            intro.className="ContentNON"
            contentBells.className="Content2"
            vinilConteiner.className="vinilConteiner"
            divControls.className="Controls"
            recordBlock.className="record"
            save.className="nonVISIBLE"
            btnToMusic.className="nonVISIBLE"
            btnToSaved.className="navBtns"
            if (storige.bells !== 0) {
                imgPlay.className="nonVISIBLE"
            }
            if (log) {
                if (log2) {
                     vinil1.className="nonVISIBLE"
                }


            } else {
                vinil1.className="vinil"
                if (logPlayStatus){
                    btnRec.className="RecStart"
                    divControls.className="Controls"
                } else {
                    btnRec.className="Rec"
                }
            }

            break;
        case 'Saved':
            intro.className="nonVISIBLE"
            vinilConteiner.className="nonVISIBLE"
            contentBells.className="nonVISIBLE"
            recordBlock.className="nonVISIBLE"
            btnToSaved.className="nonVISIBLE"
            save.className="saveBlock"
            btnToMusic.className="navBtns"
            break;
    }
}
function switchToState(newState){
    location.hash = encodeURIComponent(JSON.stringify(newState))
    }
switchToState(SPAState);





btnBack.addEventListener('click' , f)

var btnToSaved = document.getElementById('TOSAVED');
btnToSaved.addEventListener('click' , f3)


function f (){
    switchToState({pagename:'Main'})
}

function f2 () {
    switchToState({pagename:'Bells'})
}

function f3 () {
    switchToState({pagename:'Saved'})
}