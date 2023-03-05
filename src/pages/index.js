import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from 'react';
import { useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const messageInputRef = useRef(null);

  function start() {


    const urlParams = new URLSearchParams(window.location.search);
    const newSala = urlParams.get('sala');
    if (newSala !== '' && newSala !== null) {
      localStorage.setItem('sala', newSala)
    }

    const urlParams2 = new URLSearchParams(window.location.search);
    const newChave = urlParams2.get('chave');
    if (newChave !== '' && newChave !== null) {
      localStorage.setItem('chave', newChave)
    }

    const mynameInput = document.querySelector('.myname-input');
    const salaInput = document.querySelector('.sala-input');
    const chaveInput = document.querySelector('.chave-input');

    if (localStorage.getItem('nick') !== '') {
      mynameInput.value = localStorage.getItem('nick')
    }

    if (localStorage.getItem('sala') !== '') {
      salaInput.value = localStorage.getItem('sala')
    }

    if (localStorage.getItem('chave') !== '') {
      chaveInput.value = localStorage.getItem('chave')
    }

  }

  // Importar a biblioteca CryptoJS
  const CryptoJS = require("crypto-js");

  // Cria um hash SHA-256 da string
  async function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buffer)
      .then(hash => hex(hash));
  }

  // Converte o buffer de hash em uma string hexadecimal
  async function hex(buffer) {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
      const value = view.getUint32(i);
      const stringValue = value.toString(16);
      const padding = '00000000';
      const paddedValue = (padding + stringValue).slice(-padding.length);
      hexCodes.push(paddedValue);
    }
    return hexCodes.join('');
  }

  async function solicitar() {
    const salaInput = document.querySelector('.sala-input');
    localStorage.setItem('sala', salaInput.value);
    let sala = localStorage.getItem('sala')
    const chaveInput = document.querySelector('.chave-input');
    localStorage.setItem('chave', chaveInput.value);
    if (localStorage.getItem('sala') == '') sala = 'Geral'
    sala = await sha256(sala)

    // Definir a chave de criptografia
    const encryptionKey = chaveInput.value;

    // Função para descriptografar
    function decrypt(ciphertext) {
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      const plaintext = bytes.toString(CryptoJS.enc.Utf8);
      return plaintext;
    }

    const response = fetch(`https://script.google.com/macros/s/AKfycbw_MHgPKyOdX61wSh9b1olLU04cd3ioH8pU1fQPdxE04wGpwms6mvJ5a6Sj0q3RrGIX/exec?sala=${sala}`);

    response.then(res => res.json()).then(data => {
      // Percorrer todas as mensagens no objeto retornado
      const messages = data.map(message => {

        if (encryptionKey == "") {
          return message;
        }

        // Caso contrário, descriptografar a mensagem e retornar um novo objeto com a mensagem descriptografada
        const decryptedMessage = decrypt(message.message);
        return {
          ...message,
          message: decryptedMessage,
          encrypted: false // Marcar a mensagem como descriptografada
        };
      });
      setMessages(messages);
    });

    const messageContainer = document.querySelector('.message-container');
    messageContainer.scrollTop = messageContainer.scrollHeight
    const mynameInput = document.querySelector('.myname-input');
    setCurrentUser(mynameInput.value);
  }


  useEffect(() => {
    start()
    const intervalId = setInterval(solicitar, 2000);
    return () => clearInterval(intervalId);
  }, []);

  function compartilhar() {
    const salaInput = document.querySelector('.sala-input');
    const chaveInput = document.querySelector('.chave-input');
    const btn = document.querySelector('.compartilhar')
    let link = `https://chat-neon-six.vercel.app/?sala=${salaInput.value}&chave=${chaveInput.value}`
    navigator.clipboard.writeText(link);
    btn.innerHTML = 'Link copiado'
  }

  async function handleSendMessage() {
    const mynameInput = document.querySelector('.myname-input');
    localStorage.setItem('nick', mynameInput.value);

    const salaInput = document.querySelector('.sala-input');
    localStorage.setItem('sala', salaInput.value);

    const chaveInput = document.querySelector('.chave-input');
    localStorage.setItem('chave', chaveInput.value);

    const messageInput = document.querySelector('.message-input');
    const error = document.querySelector('.error-container');

    if (mynameInput.value == '') {
      error.innerHTML = 'Informe um Nick';
    } else if (messageInput.value == '') {
      error.innerHTML = 'Informe uma mensagem';
    } else {
      const newMessage = messageInput.value;
      let user = mynameInput.value;

      // Definir a chave de criptografia
      const encryptionKey = chaveInput.value;

      // Função para criptografar
      function encrypt(text) {
        const ciphertext = CryptoJS.AES.encrypt(text, encryptionKey).toString();
        return ciphertext;
      }

      let msg = encrypt(newMessage);
      let room = await sha256(salaInput.value);

      const formId = '1FAIpQLSfQutm0b9ZB8hfebHoPCDp9zxemvr--8up_Xz8zPqIzo4kn0Q';
      const url = `https://docs.google.com/forms/u/0/d/e/${formId}/formResponse`;
      const params = new URLSearchParams();
      params.append('entry.228090609', user);
      params.append('entry.2025985546', msg);
      params.append('entry.1292555410', room)

      const options = {
        method: 'POST',
        body: params,
        mode: 'no-cors',
      };
      fetch(url, options);
      messageInput.value = '';
      error.innerHTML = '';
      messageInputRef.current.focus();
    }
  }
  return (
    <>
      <Head>
        <title>CriptoChat</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>

        <h1 className='titulo'>CriptoChat</h1>

        <div className="myname-container">
          <label>Nick: </label>
          <input type="text" className="myname-input"></input>
          <label>Sala: </label>
          <input type="text" className="sala-input"></input>
          <label>Chave: </label>
          <input type="text" className="chave-input"></input>
          <button className='compartilhar' onClick={compartilhar}>Compartilhar</button>
        </div>

        <div className="message-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.user === currentUser ? 'you-message' : ''}`}>
              {`${message.user === currentUser ? 'You' : message.user}: ${message.message}`}
            </div>
          ))}
        </div>
        <div className="sendmessage-container">
          <input
            type="text"
            className="message-input"
            ref={messageInputRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button className='banco' onClick={handleSendMessage}>Enviar</button>
        </div>
        <div className="error-container"></div>
        <div className='banco-container'>
          <div className='banco'><a href='https://docs.google.com/spreadsheets/d/16WYjmFzKIJLux4kuLGlYW_km_BazomE7RZjymjlp_dM/edit?usp=sharing' target={'_blank'}> Banco de dados</a></div>
          <div className='banco'><a href='https://chat-neon-six.vercel.app/?sala=Mundo&chave=Bitcoin'> Sala: Mundo / Chave: Bitcoin</a></div>
          <div className='banco'><a href='https://github.com/pcdestroid/chat' target={'_blank'}> Github</a></div>
        </div>
      </main>
    </>
  );
}
