//updateData
import { showAlert } from './alerts'
import axios from 'axios';

export const updateData = async(email, name) => {

    try {
     /* const res = await axios.post('http://127.0.0.1:3000/api/v1/vereadores/login',{
        email,
        name
     }).then(response => console.log(response)) */
      const res = await axios({
           method: 'PATCH',
           url: 'http://localhost:3000/api/v1/vereadores/updateMe',
           data: {
               email,
               name
           }
       }); 
       console.log(res.data.status)
       if(res.data.status === 'success'){
        showAlert('success', 'Usuário atualizado');
           
       }
      
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};