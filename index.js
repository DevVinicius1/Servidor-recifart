const express = require('express');// pra fazer o rotamento e requisições /framework*
const app = express();
const mysql = require('mysql');//pra fazer a conexão com o banco de dados mysql /blibioteca*
const cors = require('cors');//utilizada em conjunto com o express pra rotas e end points e entre outros /blibioteca*
const bcrypt = require('bcrypt');//utilizada pra criptografar a senha
const saltRounds= 10;//parametro fornecido pelo bcrypt em teoria quanto mais alto o numero mais segurança e dificil de calcular o hash /bliboetca*
const jwt = require('jsonwebtoken');//pra gerar o token que é fornecida ao logar    



console.log("dsdsdsadasds")


//variavel db que recebe o parametro createPoll pra fazer a conexão com seu banco de dados
const db = mysql.createPool({
   host: 'localhost', 
   user: 'root',
   password: 'fluminense123.',
   database: 'banco_recifart'
});


app.use(express.json());

app.use(cors()); //cors é usado para correção de possiveis erros encontrado no projeto


//verifica a autenticidade dos tokens nas requisições
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; //obtem o token jwt
   
  //verifica se o token foi passado na requisição
  if (!token) {
    return res.status(403).json({ msg: 'Token não fornecido' });
  }

  //verifica a validade do token ai divide a string no espaço e pega a 2 parte que é o token real
  jwt.verify(token.split(' ')[1], 'rcfapgplpbaww', (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: 'Token inválido' });
    }

    req.user = decoded; //se for valido o usuario recebe um token decodificado que tem a suas informações
    next();//função que se tudo for valido para para o proximo midleware que no caso é um responsavel por request e respostas
  });
};



////////////////////////////////////////
//passa o parametro do express pra ligação de end points com o meu front
app.post('/register/usuario', (req, res) => {
   
  //variaveis recebendo os valores passados do meu front
   const nome= req.body.name
   const email = req.body.email;
   const cpf = req.body.cpf;
   const password = req.body.password;
 
   //aqui passa um comando query que é escrito no banco o '?' é passado no 2 parametro que verifica se o email esta em uso
   db.query('SELECT * FROM usuario WHERE USU_EMAIL = ?', [email], (err, result) => {
    
    if (err) {
      
       res.send(err);
     } else {
      // aqui verifica se tem algum resultado na consulta se não tiver ele executa 
       if (result.length === 0) {
        //comando bcrypt pra ober o hash da senha gerada
        bcrypt.hash(password,saltRounds,(err,hash) =>{
           
          //aqui envia o comando query insertando as variaves trazidas do front e o hash
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
  
  //da select pra cerificar o email
  db.query('SELECT * FROM usuario WHERE USU_EMAIL = ?', [email], (err,result) => {
    if(err) {
      res.send(err);
    }
    
    //se no resultado tiver um email que no caso o result.length vai ser maior que 0
    if(result.length > 0) {
      
      //aqui usa a senha um parametro do bycrpt pra pegar a senha utilizada antes de transforma-la em hash
      bcrypt.compare(password, result[0].USU_SENHA, (erro, isPasswordCorrect) => {
        //se tiver a senha
        if(isPasswordCorrect) {
            
          //variaveis para receber os valores passados no front
            const cpf = result[0].USU_CPF;
            const nomeCompleto =result[0].USU_NOME;
            const primeiroNome = nomeCompleto.split(' ')[0]; 
            //essa variavel quando encontra um espaço ela corta e entrega somente o primeiro nome
         
          //aqui eu envio o token para front contendo as informações do email/primeironome/nome e id que pode ser cpf/cnpj  
          const token = jwt.sign({ email: email ,nome: primeiroNome,nomeC:nomeCompleto,id: cpf}, 'rcfapgplpbaww', { expiresIn: '1h' });    
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
//nos outros seguem literalmente a mesma lógica
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
          const token = jwt.sign({ email: email ,nome: primeiroNome, nomeC: nomeCompleto,id: cnpj }, 'rcfapgplpbaww', { expiresIn: '1h' });    
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
         
         
          const token = jwt.sign( { email: email, nome: primeiroNome ,nomeC:nomeCompleto , id: cpf } , 'rcfapgplpbaww', { expiresIn: '1h' });    
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















app.listen(3002, () => {
   console.log('Rodando na porta 3002');
});
