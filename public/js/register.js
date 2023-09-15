const nameInput = document.getElementById('name-input')
const emailInput = document.getElementById('email-login')
const passwordInput = document.getElementById('password-login')
const form = document.querySelector('form')

console.log(nameInput, emailInput, passwordInput)
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = nameInput.value
    const email = emailInput.value
    const password = passwordInput.value
try{
   const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    })
    if(response.status === 200) {
        window.location.assign('/game')
    }
} catch(err) {
    console.log(err)
}
});
