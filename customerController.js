'use strict'

// Asenna ensin mysql driver 
// npm install mysql --save

var mysql = require('mysql');
var validator = require('./validationService');

var connection = mysql.createConnection({
  host : 'localhost', // tietokantapalvelimen osoite
  port : 3307, // jos oletusportti ei toimi
  user : 'root', // kehitysatarkoituksessa voidaan käyttää root-käyttäjää. Tuotannossa ei saa käyttää root-käyttäjää
  password : 'root', // voi olla tyhjäkin, käyttäkää sitä mikä teillä on
  database : 'asiakas' // tai asiakas_woj
});

module.exports = 
{
    fetchTypes: function (req, res) {
      var sql = 'SELECT avain, lyhenne, selite FROM Asiakastyyppi';  
      connection.query(sql, function(error, results, fields){
        if ( error ){
            console.log("Virhe haettaessa dataa Asiakastyyppi-taulusta: " + error);
            res.status(500); // Tämä lähtee selaimelle
            res.json({"status" : "ei toiminut"}); // Ja tämä lähtee selaimelle
        }
        else
        {
          console.log("Data = " + JSON.stringify(results));
          res.json(results); // onnistunut data lähetetään selaimelle (tai muulle)
        }
    });

    },

    fetchCustomers: function(req, res){
      console.log(req.query.asty_avain);
      var sql = 'SELECT avain, nimi, osoite, postinro, postitmp, luontipvm, asty_avain from asiakas where 1 = 1';
      if (req.query.nimi != null)
        sql = sql + " and nimi like '" + req.query.nimi + "%'";
      if (req.query.osoite != null)
        sql = sql + " and osoite like '" + req.query.osoite + "%'";     
      if (req.query.asty_avain != null && req.query.asty_avain != "")
        sql += " and asty_avain=" + req.query.asty_avain;
        
      connection.query(sql, function(error, results, fields){
        if ( error ){
            console.log("Virhe haettaessa dataa Asiakas-taulusta: " + error);
            res.status(500); // Tämä lähtee selaimelle
            res.json({"status" : "ei toiminut"}); // Ja tämä lähtee selaimelle
        }
        else
        {
          console.log("Data = " + JSON.stringify(results));
          res.json(results);
        }
    
      });
      console.log("Body = " + JSON.stringify(req.body));
      console.log("Params = " + JSON.stringify(req.params));
    },  

    create: function(req, res){

      // Katsotaan onko kaikki tiedot täytetty ok, jos ei niin pistetään 400
      if (!validator.isValidCustomer(req.body)) {
        res.status(400);
        res.json({"statusMessage" : "Asiakkaan tietoja ei toimitettu"});
        return;
      }
      // Ensin tarkistetaan onko tarvittavat kentät
      // Jos ei, niin res.status(400) ja res.json({"status": "viesti"})
      // Jos on, niin -->
      //connection.query...
      const sqlQuery = `INSERT INTO Asiakas (NIMI, OSOITE, POSTINRO, POSTITMP, LUONTIPVM, ASTY_AVAIN) VALUES ('${req.body.nimi}', '${req.body.osoite}','${req.body.postinro}', '${req.body.postitmp}', curdate(), ${req.body.asty_avain});`;
      console.log(sqlQuery);
      connection.query(sqlQuery, function(error, results, fields){

        if (error) {
          console.log("Virhe lisättäessä tietoa asiakas-tauluun: " + error);
              res.status(500); // Tämä lähtee selaimelle
              res.json({"status" : "ei toiminut"}); // Ja tämä lähtee selaimelle
        }
        else
        {
          console.log("Data = " + JSON.stringify(results));
          res.json(results);
        }
      });
      console.log("Data = " + JSON.stringify(req.body));
      console.log(req.body.nimi); // jos tulee undefined, niin silloin ei ole nimi avainta 
      
    },

    update: function(req, res){

      // UPDATE asiakas SET nimi="Aku Ankka", osoite="Testikuja"..... ,WHERE avain=17
      const sqlQuery = `UPDATE asiakas SET NIMI='${req.body.nimi}', OSOITE=${req.body.osoite}, POSTINRO='${req.body.postinro}', POSTITMP='${req.body.postitmp}', ASTY_AVAIN='${req.body.asty_avain}' WHERE AVAIN = ${req.body.params.id};`;
      console.log(sqlQuery);
      connection.query(sqlQuery, function(error, results, fields) {
        if (error) {
          console.log("Virhe lisättäessä tietoa asiakas-tauluun: " + error);
              res.status(500); // Tämä lähtee selaimelle
              res.json({"status" : "ei toiminut"}); // Ja tämä lähtee selaimelle
        }
        else
        {
          console.log("Data = " + JSON.stringify(results));
          res.json(results);
        }
      });
    },
    fetchCustomer: function(req, res) {
      const sqlQuery = `SELECT * FROM ASIAKAS WHERE avain = ${req.params.id};`

      connection.query(sql, function(error, results, fields){
        if ( error ){
            console.log("Virhe haettaessa dataa Asiakas-taulusta: " + error);
            res.status(500); // Tämä lähtee selaimelle
            res.json({"status" : "ei toiminut"}); // Ja tämä lähtee selaimelle
        }
        else
        {
          if (results) {
            console.log("Data = " + JSON.stringify(results));
            res.json(results);
          }
          else {
            res.status(404);
            res.json({"status": "ei löytynyt"});
          }
        }
      });
    },

    delete : function (req, res) {
      // connection.query...
      // DELETE FROM asiakas WHERE avain=13;
        console.log("Params = " + JSON.stringify(req.params)); // Tänne tulee id: req.params.id
        console.log(req.params.id);
        if (!validator.isValidIdentifier(req.params.id)) {
          res.status(400);
          res.json({"statusMsg" : "Poistettavan asiakkaan id ei ole kelvollinen"});
          return;
        }
        const sqlQuery = `DELETE FROM Asiakas WHERE avain=${req.params.id};`
        connection.query(sqlQuery, function(error, results, fields){

          if (error) {
            console.log("Virhe poistettaessa tietoa asiakas-taulusta: " + error);
                res.status(500); // Tämä lähtee selaimelle
                res.json({"status" : "ei toiminut"}); // Ja tämä lähtee selaimelle
                return;
          }
          else
          {
            if (results.affectedRows <= 0) {
              res.status(404);
              res.json({"status" : `Ei löytetty poistettavaa id:llä ${req.params.id}`});
              return;
            } 
            console.log("Data = " + JSON.stringify(results));
            res.json(results);
          }
        });
        
    }
}
