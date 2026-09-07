const dimensioneGriglia = 8;
let grigliaDati = [];

let mosseFatte = 0;
let mosseDisponibili = 40;
let bersagliColpiti = 0; 

let tempoTrascorso = 0;
let idCronometro = null;


const flottaNavale = [4, 3, 3, 2, 2, 2, 1, 1];


const tavolozzaNavi = [
    "#ef4444", 
    "#f97316", 
    "#eab308", 
    "#10b981", 
    "#a855f7", 
    "#64748b", 
    "#ec4899", 
    "#06b6d4"  
];

const coloreSfondoAcqua = "#3b82f6";

window.onload = function () {
    const elementoTabellone = document.getElementById("tabellone");

    
    for (let i = 0; i < dimensioneGriglia * dimensioneGriglia; i++) {
        const r = Math.floor(i / dimensioneGriglia);
        const c = i % dimensioneGriglia;

        let divCasella = document.createElement("div");
        divCasella.classList.add("casella");
        elementoTabellone.append(divCasella);

        divCasella.addEventListener("click", function () {
            gestisciClick(r, c);
        });
    }


    for (let r = 0; r < dimensioneGriglia; r++) {
        grigliaDati[r] = [];
        for (let c = 0; c < dimensioneGriglia; c++) {
            const pos = r * dimensioneGriglia + c;
            grigliaDati[r][c] = {
                contieneNave: false,
                indiceNave: -1,
                coloreCasella: coloreSfondoAcqua,
                rifElemento: elementoTabellone.children[pos],
                scoperta: false
            };
        }
    }

    disponiFlotta();
    stampaInfo();

    idCronometro = setInterval(aggiornaTempo, 1000);
};

function aggiornaTempo() {
    tempoTrascorso++;
    const minuti = Math.floor(tempoTrascorso / 60);
    const secondi = tempoTrascorso % 60;
    const tempoFormattato = `${minuti}:${secondi < 10 ? "0" : ""}${secondi}`;
    document.getElementById("orologio").innerHTML = tempoFormattato;
}

function disponiFlotta() {
    for (let i = 0; i < flottaNavale.length; i++) {
        const dimensione = flottaNavale[i];
        let inserita = false;

        while (!inserita) {
            const eOrizzontale = Math.random() < 0.5;
            const rigaInizio = Math.floor(Math.random() * dimensioneGriglia);
            const colInizio = Math.floor(Math.random() * dimensioneGriglia);

            if (spazioValido(rigaInizio, colInizio, dimensione, eOrizzontale)) {
                for (let k = 0; k < dimensione; k++) {
                    const r = eOrizzontale ? rigaInizio : rigaInizio + k;
                    const c = eOrizzontale ? colInizio + k : colInizio;
                    grigliaDati[r][c].contieneNave = true;
                    grigliaDati[r][c].indiceNave = i;
                    grigliaDati[r][c].coloreCasella = tavolozzaNavi[i];
                }
                inserita = true;
            }
        }
    }
}

function spazioValido(riga, colonna, lunghezza, orizzontale) {
    for (let k = 0; k < lunghezza; k++) {
        const r = orizzontale ? riga : riga + k;
        const c = orizzontale ? colonna + k : colonna;

        if (r < 0 || r >= dimensioneGriglia || c < 0 || c >= dimensioneGriglia) {
            return false;
        }
        if (grigliaDati[r][c].contieneNave) {
            return false;
        }
    }
    return true;
}

function gestisciClick(riga, colonna) {
    const cel = grigliaDati[riga][colonna];
    if (cel.scoperta) return;

    cel.scoperta = true;
    mosseFatte++;
    mosseDisponibili--;

    if (cel.contieneNave) {
        cel.rifElemento.classList.add("stato-colpito");
        cel.rifElemento.style.backgroundColor = cel.coloreCasella;
        bersagliColpiti++;

        verificaAffondamento(cel.indiceNave);
    } else {
        cel.rifElemento.classList.add("stato-acqua");
        document.getElementById("notifica").innerHTML = "Acqua!";
    }

    stampaInfo();
    verificaEsito();
}

function verificaAffondamento(idNave) {
    let partiColpite = 0;
    for (let r = 0; r < dimensioneGriglia; r++) {
        for (let c = 0; c < dimensioneGriglia; c++) {
            if (grigliaDati[r][c].indiceNave === idNave && grigliaDati[r][c].scoperta) {
                partiColpite++;
            }
        }
    }

    if (partiColpite === flottaNavale[idNave]) {
        document.getElementById("notifica").innerHTML = "💥 Nave affondata!";
    } else {
        document.getElementById("notifica").innerHTML = "🎯 Nave colpita!";
    }
}

function stampaInfo() {
    document.getElementById("contLanci").innerHTML = mosseFatte;
    document.getElementById("contRimanenti").innerHTML = mosseDisponibili;
    document.getElementById("contAsegno").innerHTML = bersagliColpiti;
}

function verificaEsito() {
    if (bersagliColpiti === 18) {
        clearInterval(idCronometro);
        document.getElementById("tabellone").classList.add("blocco-griglia");
        document.getElementById("esitoGioco").innerHTML = "<h4 class='text-success mt-2'>🏆 Hai Vinto! Tutte le navi affondate!</h4>";
    } else if (mosseDisponibili === 0) {
        clearInterval(idCronometro);
        document.getElementById("tabellone").classList.add("blocco-griglia");
        document.getElementById("esitoGioco").innerHTML = "<h4 class='text-danger mt-2'>❌ Tentativi esauriti! Hai perso!</h4>";
        document.getElementById("bottoneMostra").classList.remove("disabled");
    }
}

function riavviaPartita() {
    for (let r = 0; r < dimensioneGriglia; r++) {
        for (let c = 0; c < dimensioneGriglia; c++) {
            grigliaDati[r][c].contieneNave = false;
            grigliaDati[r][c].indiceNave = -1;
            grigliaDati[r][c].coloreCasella = coloreSfondoAcqua;
            grigliaDati[r][c].scoperta = false;

            grigliaDati[r][c].rifElemento.classList.remove("stato-colpito", "stato-acqua");
            grigliaDati[r][c].rifElemento.style.backgroundColor = "";
        }
    }

    document.getElementById("tabellone").classList.remove("blocco-griglia");
    document.getElementById("esitoGioco").innerHTML = "";
    document.getElementById("notifica").innerHTML = "";
    document.getElementById("bottoneMostra").classList.add("disabled");

    mosseFatte = 0;
    mosseDisponibili = 40;
    bersagliColpiti = 0;
    tempoTrascorso = 0;

    stampaInfo();
    disponiFlotta();

    clearInterval(idCronometro);
    idCronometro = setInterval(aggiornaTempo, 1000);
}

function scopriNavi() {
    for (let r = 0; r < dimensioneGriglia; r++) {
        for (let c = 0; c < dimensioneGriglia; c++) {
            if (grigliaDati[r][c].contieneNave) {
                grigliaDati[r][c].rifElemento.style.backgroundColor = grigliaDati[r][c].coloreCasella;
            } else {
                grigliaDati[r][c].rifElemento.style.backgroundColor = coloreSfondoAcqua;
            }
        }
    }
}