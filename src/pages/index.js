import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import { useState, useEffect } from 'react';
import { useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  // const [currentSalar, setcurrentSalar] = useState('Geral');
  const messageInputRef = useRef(null);

  function start() {

    const urlParams = new URLSearchParams(window.location.search);
    const newSala = urlParams.get('sala');
    if (newSala !== '' && newSala !== null) {
      localStorage.setItem('sala', newSala)
    }

    const mynameInput = document.querySelector('.myname-input');
    const salaInput = document.querySelector('.sala-input');
    if (localStorage.getItem('nick') !== '') {
      mynameInput.value = localStorage.getItem('nick')
    }
    if (localStorage.getItem('sala') !== '') {
      salaInput.value = localStorage.getItem('sala')
      // setcurrentSalar(localStorage.getItem('sala'))
    }
  }

  function solicitar() {
    const salaInput = document.querySelector('.sala-input');
    localStorage.setItem('sala', salaInput.value);
    let sala = localStorage.getItem('sala')
    if (localStorage.getItem('sala') == '') sala = 'Geral'
    const response = fetch(`https://script.google.com/macros/s/AKfycbw_MHgPKyOdX61wSh9b1olLU04cd3ioH8pU1fQPdxE04wGpwms6mvJ5a6Sj0q3RrGIX/exec?sala=${sala}`);
    response.then(res => res.json()).then(data => setMessages(data));
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

  function handleSendMessage() {
    const mynameInput = document.querySelector('.myname-input');
    localStorage.setItem('nick', mynameInput.value);

    const salaInput = document.querySelector('.sala-input');
    localStorage.setItem('sala', salaInput.value);

    const messageInput = document.querySelector('.message-input');
    const error = document.querySelector('.error-container');

    if (mynameInput.value == '') {
      error.innerHTML = 'Informe um Nick';
    } else if (messageInput.value == '') {
      error.innerHTML = 'Informe uma mensagem';
    } else {
      const newMessage = messageInput.value;
      let user = mynameInput.value;
      let msg = newMessage;
      let room = salaInput.value;

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
        <title>Bate papo</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>

        <div className="myname-container">
          <label>Nick: </label>
          <input type="text" className="myname-input"></input>
          <label>Sala: </label>
          <input type="text" className="sala-input"></input>
          <label>Chave: </label>
          <input type="text" className="chave-input"></input>
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
          <button onClick={handleSendMessage}>Enviar</button>
        </div>
        <div className="error-container"></div>
        <div className='banco'><a href='https://docs.google.com/spreadsheets/d/16WYjmFzKIJLux4kuLGlYW_km_BazomE7RZjymjlp_dM/edit?usp=sharing' target={'_blank'}> Banco de dados</a></div>
      </main>
    </>
  );
}
