const bcrypt = require('bcrypt');

const passwords = [
    { name: 'María Roncesvalles', password: 'contraseñaMaria' },
    { name: 'Carmen Sanz', password: 'contraseñaCarmen' },
    { name: 'Paula Gutierrez', password: 'contraseñaPaula' },
];

async function hashPasswords() {
    for (let user of passwords) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log(`Nombre: ${user.name}, Contraseña hasheada: ${hashedPassword}`);
    }
}

hashPasswords();
