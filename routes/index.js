const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { stringify } = require("actions-on-google/dist/common");
const { Payload } = require("dialogflow-fulfillment");
const firebase = require("firebase");                           //aggiunta requirements
const admin = require("firebase-admin");
const { compileClientWithDependenciesTracked } = require("jade");
const firebaseConfig = {
  apiKey: "AIzaSyB15NhiFr3mru_rMZ_F6_wPGs2oquj3RV4",
  authDomain: "progettolil.firebaseapp.com",
  projectId: "progettolil",
  storageBucket: "progettolil.appspot.com",
  messagingSenderId: "496952659320",
  appId: "1:496952659320:web:44069f549a7ac9a9d74c8d"
  };
  firebase.initializeApp(firebaseConfig);   //connessione database firebase

var db = firebase.firestore();
//esporto i nomi delle funzioni mappate
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  const agent = new WebhookClient({ request: req, response: res })
    
  let intentMap = new Map()
  

  //Creo la mappa di associazione "Nome Intent" - "Nome funzione callback"
  intentMap.set("Benvenuto", benvenuto);
  intentMap.set("PIN-Instagram", instagram);
  intentMap.set("PIN - Note - Progresso", progresso);
  intentMap.set("PIN - Note - Soldi", soldi);
  intentMap.set("Agisci",nbottoni);
  intentMap.set("Finale-Polizia",finalePolizia);
  intentMap.set("Finale-Omar",finaleOmar);
  //intetMap.set("nomeintent",nomefunzione);

  agent.handleRequest(intentMap);

  async function benvenuto(agent){
    var nome = agent.parameters.nome;
    const dataset = {
      Nome : nome,
      Luogo: "???",
      Data: "???",
      Soldi: "???"
    }
    
    var check = await check_utente(nome);
    if(check){
      var id = "";
      var id_tmp = await getId(nome);
      id += id_tmp;
      db.collection("utenti").doc(id).update(dataset);
    }
    else
      db.collection("utenti").add(dataset);
    agent.add("Ciao " + nome + ", tuo cugino Giorgio è scomparso da qualche giorno. \nHai trovato il suo telefono e il tuo obiettivo è quello di scoprire cosa è successo. \nIn base alle tue azioni, il finale della storia potrà cambiare.");
    agent.add("Per prima cosa devi scoprire qual è il PIN per sbloccare il telefono. \nSuggerimento: defenestrazione di Praga");
  }

  async function instagram(agent){
    var nome = agent.parameters.nome;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    dd = parseInt(dd)+1;
    today = dd + '/' + mm + '/' + yyyy;
    const dataset = {
      Luogo: "Sottoripa",
      Data: today
    }
    console.log(nome);
      var id = "";
      var id_tmp = await getId(nome);
      id += id_tmp;
      db.collection("utenti").doc(id).update(dataset);
  }

  async function check_utente(nome){
    return db.collection("utenti").where("Nome", "==", nome)
      .get()
      .then(function(querySnapshot) {
        var flag = false;
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            flag = true;
        });
        return flag;
      }) 
  }
  async function getId(nome) {
    var id = "";
    return db.collection("utenti").where("Nome", "==", nome)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
             id = doc.id;
            
        });
        return id;
      });
      
  }
  async function progresso(agent){
    var nome = agent.parameters.nome;
    var id = "";
    var id_tmp = await getId(nome);
    id += id_tmp;
    var dataset = await get_info(nome);

    var payload = {
      "telegram": {
        "parse_mode": "Markdown",
        "text": " ```   Luogo:" + dataset.Luogo +"\n   Data:"+ dataset.Data + "\n   Soldi:"+dataset.Soldi+"```\n Puoi ritrovare il progresso del gioco nelle note"
      }
    };
    var payload2 = {
      "telegram": {
        "parse_mode": "Markdown",
        "text": "```   Luogo:" + dataset.Luogo +"\n   Data:"+ dataset.Data + "\n   Soldi:"+dataset.Soldi+"```\n Puoi ritrovare il progresso del gioco nelle note\n\nCosa vuoi fare?",
        "resize_keyboard": true,
        "reply_markup": {
          "keyboard": [
            [
              {
                "text": "Registro telefonate",
                "callback_data": "registro_telefonate"
              },
              {
                "text": "Telegram",
                "callback_data": "telegram"
              }
            ],
            [
              {
                "text": "Instagram",
                "callback_data": "instagram"
              },
              {
                "text": "Note",
                "callback_data": "note"
              },
              {
                "callback_data": "Agisci",
                "text": "Agisci"
              }
            ]
          ]
        },
        "one_time_keyboard": true
      }
    }
    //agent.add(new Payload(agent.UNSPECIFIED, payload,{rawPayload: true, sendAsMessage: true}));
    agent.add(new Payload(agent.UNSPECIFIED, payload2,{rawPayload: true, sendAsMessage: true}));

    
  }
  async function get_info(nome){
    
    return db.collection("utenti").where("Nome", "==", nome)
      .get()
      .then(function(querySnapshot) {
        var dataset = {};
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
             dataset = {
               Luogo: doc.data().Luogo,
               Data: doc.data().Data,
               Soldi: doc.data().Soldi
             }
             
            
        });
        console.log(dataset);
        return dataset;
      });
  }

  async function soldi(agent){
    var nome = agent.parameters.nome;
    const dataset = {
      Soldi: "1234€"
    }
    console.log(nome);
      var id = "";
      var id_tmp = await getId(nome);
      id += id_tmp;
      db.collection("utenti").doc(id).update(dataset);
      var payload2 = {
        "telegram": {
          "text": "Ricordati 1234€",
           
          "reply_markup": {
            "keyboard": [
              [
                {
                  "text": "Registro telefonate",
                  "callback_data": "registro_telefonate"
                },
                {
                  "text": "Telegram",
                  "callback_data": "telegram"
                }
              ],
              [
                {
                  "text": "Instagram",
                  "callback_data": "instagram"
                },
                {
                  "text": "Note",
                  "callback_data": "note"
                },
                {
                  "callback_data": "Agisci",
                  "text": "Agisci"
                }
              ]
            ]
          },
          "one_time_keyboard": true
        }
      }
      //agent.add(new Payload(agent.UNSPECIFIED, payload,{rawPayload: true, sendAsMessage: true}));
      agent.add(new Payload(agent.UNSPECIFIED, payload2,{rawPayload: true, sendAsMessage: true}));
  }

  async function nbottoni(agent){
    var nome = agent.parameters.nome;
    var dataset = await get_info(nome);
    
    var payload2 = {};
    if(dataset.Data !== "???"){
      payload2 = {
        "telegram": {
          "text": "Come vuoi agire?",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [ 
              [
                {
                  "text": "Chiama la polizia",
                  "callback_data": "finale_polizia"
                },
                {
                  "text": "Chiama i genitori",
                  "callback_data": "finale_enitori"
                },
                {
                  "text": "Cerca Omar",
                  "callback_data": "finale_omar"
                }
              ]
            ]
          },
          "one_time_keyboard": true
        }
      }
    }
    else{
      payload2 = {
        "telegram": {
          "text": "Come vuoi agire?",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [
              [
                {
                  "text": "Chiama la polizia",
                  "callback_data": "finale_polizia"
                },
                {
                  "text": "Chiama i genitori",
                  "callback_data": "finale_genitori"
                }
              ]
            ]
          },
          "one_time_keyboard": true
        }
      };
    }
    agent.add(new Payload(agent.UNSPECIFIED, payload2,{rawPayload: true, sendAsMessage: true}));
  }
  /* 
    CONTROLLO PER FAR CAPIRE QUALI BOTTONI MOSTRARE

    if(luogo != ???){ 
        payload 3 bottoni
    }
    else{
      payload 2 bottoni
    }

  */
 async function finalePolizia(agent){
  var nome = agent.parameters.nome;
  var dataset = await get_info(nome);
  var soldi, data, luogo;
    if(dataset.Soldi==="???") soldi = 0; else soldi = 1;
    if(dataset.Data==="???") data = 0; else data = 1;
    if(dataset.Luogo==="???") luogo = 0; else luogo = 1;
    var sum = 4*soldi + 2*data + luogo;
    var payload2 = {};
    if(sum==0 || sum==4){
      payload2 = {
        "telegram": {
          "text": "Finale Rita",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [
              [
                "Crediti"
              ]
            ]
          },
          "one_time_keyboard": true
        }
      };
    }
    else{
      payload2 = {
        "telegram": {
          "text": "Finale Mattia e Luca",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [
              [
                "Crediti"
              ]
            ]
          },
          "one_time_keyboard": true
        }
      };
    }
    agent.add(new Payload(agent.UNSPECIFIED, payload2,{rawPayload: true, sendAsMessage: true}));
}
async function finaleOmar(agent){
  var nome = agent.parameters.nome;
  var dataset = await get_info(nome);
  var soldi, data, luogo;
    if(dataset.Soldi==="???") soldi = 0; else soldi = 1;
    if(dataset.Data==="???") data = 0; else data = 1;
    if(dataset.Luogo==="???") luogo = 0; else luogo = 1;
    var sum = 4*soldi + 2*data + luogo;
    var payload2 = {};
    if(sum === 1 || sum === 3){
      payload2 = {
        "telegram": {
          "text": "Finale Gaia",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [
              [
                "Crediti"
              ]
            ]
          },
          "one_time_keyboard": true
        }
      };
    }
    else if(sum === 5){
      payload2 = {
        "telegram": {
          "text": "Finale Rita",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [
              [
                "Crediti"
              ]
            ]
          },
          "one_time_keyboard": true
        }
      };
    }
    else if(sum === 7){
      payload2 = {
        "telegram": {
          "text": "Finale Mattia e Luca",
          "resize_keyboard": true,
          "reply_markup": {
            "keyboard": [
              [
                "Crediti"
              ]
            ]
          },
          "one_time_keyboard": true
        }
      };
    }
    agent.add(new Payload(agent.UNSPECIFIED, payload2,{rawPayload: true, sendAsMessage: true}));
}
});




module.exports = router;
