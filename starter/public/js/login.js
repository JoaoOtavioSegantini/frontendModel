import axios from 'axios';
import { showAlert } from './alerts'

export const login = async(email, password) => {

    try {
     /* const res = await axios.post('http://127.0.0.1:3000/api/v1/vereadores/login',{
        email,
        password
     }).then(response => console.log(response)) */
      const res = await axios({
           method: 'POST',
           url: 'http://localhost:3000/api/v1/vereadores/login',
           data: {
               email,
               password
           }
       }); 
       console.log(res.data.status)
       if(res.data.status === 'success'){
        showAlert('success', 'Você está logado!!!');
           window.setTimeout(() => {
               location.assign('/');
           }, 1500);
       }
      
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

