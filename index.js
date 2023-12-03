const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds= 10;
const jwt = require('jsonwebtoken');

const db = mysql.createPool({
   host: 'localhost',
   user: 'root',
   password: 'fluminense123.',
   database: 'banco_recifart'
});


app.use(express.json());

app.use(cors()); //cors é usado para correção de possiveis erros encontrado no projeto

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ msg: 'Token não fornecido' });
  }

  jwt.verify(token.split(' ')[1], 'rcfapgplpbaww', (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: 'Token inválido' });
    }

    req.user = decoded;
    next();
  });
};



////////////////////////////////////////
app.post('/register/usuario', (req, res) => {
   
   const nome= req.body.name
   const email = req.body.email;
   const cpf = req.body.cpf;
   const password = req.body.password;
 

   db.query('SELECT * FROM usuario WHERE USU_EMAIL = ?', [email], (err, result) => {
     if (err) {
      
       res.send(err);
     } else {
      
       if (result.length === 0) {
        bcrypt.hash(password,saltRounds,(err,hash) =>{
         
          db.query('INSERT INTO usuario (USU_NOME,USU_EMAIL,USU_CPF,USU_SENHA) VALUES (?, ?, ?, ?)',
            [nome,email,cpf, hash],
            (err, result) => {
              if (err) {
        
                res.send(err);
              } else {
              
                res.send({msg:'Cadastrado com sucesso'});
              }
            }
          );
        })
       
       } else {
     
         res.send({msg:'Email já está em uso'});
       }
     }
   });
 });

 app.post('/login/usuario', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query('SELECT * FROM usuario WHERE USU_EMAIL = ?', [email], (err,result) => {
    if(err) {
      res.send(err);
    }

    if(result.length > 0) {
      bcrypt.compare(password, result[0].USU_SENHA, (erro, isPasswordCorrect) => {
        if(isPasswordCorrect) {
           
            const cpf = result[0].USU_CPF;
            const nomeCompleto =result[0].USU_NOME;
            const primeiroNome = nomeCompleto.split(' ')[0];
          const token = jwt.sign({ email: email ,nome: primeiroNome,nomeC:nomeCompleto,cpf: cpf}, 'rcfapgplpbaww', { expiresIn: '1h' });    
          res.json({ msg: 'Usuário está logado', token });
        } else {
          res.status(401).json({ msg: 'Senha incorreta' });
        }
      });
    } else {
      res.status(401).json({ msg: 'O email está incorreto' });
    }
  });
});
//////////////////////////////
app.post('/register/empresa', (req, res) => {
   
   const nome= req.body.name
   const email = req.body.email;
   const cnpj = req.body.cnpj;
   const password = req.body.password;
 

   db.query('SELECT * FROM empresa WHERE EMP_EMAIL = ?', [email], (err, result) => {
     if (err) {
      
       res.send(err);
     } else {
      
       if (result.length === 0) {
        bcrypt.hash(password,saltRounds,(err,hash) =>{
         
          db.query('INSERT INTO empresa (EMP_NOME,EMP_EMAIL,EMP_CNPJ,EMP_SENHA) VALUES (?, ?, ?, ?)',
            [nome,email,cnpj, hash],
            (err, result) => {
              if (err) {
        
                res.send(err);
              } else {
              
                res.send({msg:'Cadastrado com sucesso'});
              }
            }
          );
        })
       
       } else {
     
         res.send({msg:'Email já está em uso'});
       }
     }
   });
 });

   app.post('/login/empresa', (req,res) => {
   const email = req.body.email;
   const password = req.body.password;
 
    db.query('SELECT * FROM empresa WHERE EMP_EMAIL = ?', [email], (err,result) => {
     if(err) {
    req.send(err)
        
     }
     if(result.length > 0) {
      bcrypt.compare(password, result[0].EMP_SENHA, (erro, isPasswordCorrect) => {
        if(isPasswordCorrect) {

            
            const cnpj =result[0].EMP_CNPJ;
            const nomeCompleto =result[0].EMP_NOME;
            const primeiroNome = nomeCompleto.split(' ')[0];
          const token = jwt.sign({ email: email ,nome: primeiroNome, nomeC: nomeCompleto,cnpj: cnpj }, 'rcfapgplpbaww', { expiresIn: '1h' });    
          res.json({ msg: 'Usuário está logado', token });
        } else {
          res.status(401).json({ msg: 'Senha incorreta' });
        }
      });
    } else {
      res.status(401).json({ msg: 'O email está incorreto' });
    }
  });
});;
////////////////////////////////////////
app.post('/register/artesao', (req, res) => {
   
   const nome= req.body.name
   const email = req.body.email;
   const cpf = req.body.cpf;
   const password = req.body.password;
 

   db.query('SELECT * FROM artesao WHERE ART_EMAIL = ?', [email], (err, result) => {
     if (err) {
      
       res.send(err);
     } else {
      
       if (result.length === 0) {
        bcrypt.hash(password,saltRounds,(err,hash) =>{
         
          db.query('INSERT INTO artesao (ART_NOME,ART_EMAIL,ART_CPF,ART_SENHA) VALUES (?, ?, ?, ?)',
            [nome,email,cpf, hash],
            (err, result) => {
              if (err) {
        
                res.send(err);
              } else {
              
                res.send({msg:'Cadastrado com sucesso'});
              }
            }
          );
        })
       
       } else {
     
         res.send({msg:'Email já está em uso'});
       }
     }
   });
 });

   app.post('/login/artesao', (req,res) => {
   const email = req.body.email;
   const password = req.body.password;
 
    db.query('SELECT * FROM artesao WHERE ART_EMAIL = ?', [email], (err,result) => {
     if(err) {
    req.send(err)
        
     }
     if(result.length > 0) {
      bcrypt.compare(password, result[0].ART_SENHA, (erro, isPasswordCorrect) => {
        
        if(isPasswordCorrect) {
         
            const cpf = result[0].ART_CPF;
            const nomeCompleto =result[0].ART_NOME;
            const primeiroNome = nomeCompleto.split(' ')[0];
         
         
          const token = jwt.sign( { email: email, nome: primeiroNome ,nomeC:nomeCompleto , cpf: cpf } , 'rcfapgplpbaww', { expiresIn: '1h' });    
          res.json({ msg: 'Usuário está logado', token });
        } else {
          res.status(401).json({ msg: 'Senha incorreta' });
        }
      });
    } else {
      res.status(401).json({ msg: 'O email está incorreto' });
    }
  });
});














app.get('/pagina-protegida-artesao', verifyToken, (req, res) => {
  res.json({ msg: 'Página protegida acessada com sucesso para artesão' });
});



app.listen(3002, () => {
   console.log('Rodando na porta 3002');
});
