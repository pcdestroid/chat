
//Esse script é utilizado no Google App Script
const chat = SpreadsheetApp.openById('16WYjmFzKIJLux4kuLGlYW_km_BazomE7RZjymjlp_dM').getSheetByName('Chat');

function doPost(e) {
  let result = e.postData.getDataAsString();
  return ContentService.createTextOutput({ 'message': 'Ok' || 'empty' });
}

function doGet(e) {
  let sala = e.parameter.sala;
  let messages = chat.getDataRange().getValues();

  const messagesObject = messages.slice(1)
    .map(message => {
      if (sala === message[3]) {
        return {
          timestamp: message[0],
          user: message[1],
          message: message[2],
          sala: message[3],
        };
      } else {
        return undefined; // Retorne undefined para excluir esse elemento do array resultante
      }
    })
    .filter(Boolean); // Filtra o array resultante para remover qualquer elemento undefined

  let json = JSON.stringify(messagesObject);
  return ContentService.createTextOutput(json);
}
