import '@babel/polyfill';
import { displayMap } from './mapbox'
import { login, logout } from './login'
import { updateData } from './updateSettings'

//elementos
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout')
const saveSetting = document.querySelector('.form-user-data')
const passwordSetting = document.querySelector('.form-user-password')

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations);
}

if(loginForm)
loginForm.addEventListener('submit', e =>{
    e.preventDefault();
    //valores
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);

  });

  if(logOutBtn) logOutBtn.addEventListener('click', logout);

  if(saveSetting) saveSetting.addEventListener('submit', e => {
      e.preventDefault();
     // const name = document.getElementById('name').value;
    //  const email = document.getElementById('email').value;

   //   updateData({email, name}, 'dados');
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateData(form, 'dados');

  })

  if(passwordSetting) passwordSetting.addEventListener('submit', async e => {
      e.preventDefault();

      document.querySelector('.btn--save-password').textContent = 'Atualizando...'
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

     await updateData({ passwordCurrent, password, passwordConfirm}, 'senha');
     document.querySelector('.btn--save-password').textContent = 'salvar senha'

    

     document.getElementById('password-current').value = '';
     document.getElementById('password').value = '';
     document.getElementById('password-confirm').value = '';

     

  });