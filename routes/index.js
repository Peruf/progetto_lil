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
    agent.add("ciao");
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
});


module.exports = router;
