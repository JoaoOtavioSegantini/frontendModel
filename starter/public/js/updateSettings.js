//updateData
import { showAlert } from './alerts'
import axios from 'axios';

export const updateData = async(data, type) => {

    try {
        const url = type === 'senha' ? 'http://localhost:3000/api/v1/vereadores/updateMyPassword' : 'http://localhost:3000/api/v1/vereadores/updateMe'
     /* const res = await axios.post('http://127.0.0.1:3000/api/v1/vereadores/login',{
        email,
        name
     }).then(response => console.log(response)) */
      const res = await axios({
           method: 'PATCH',
           url,
           data
       }); 
       console.log(res.data.status)
       if(res.data.status === 'success'){
        showAlert('success', `${type.toUpperCase()} ${type === 'dados' ? ` atualizados com sucesso!` : ' atualizada com sucesso!'}`);
           
       }
      
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};