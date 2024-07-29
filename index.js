import greet from './greet.js';
import yo from './yo.js';
import chalk from 'chalk'
import cowsay from 'cowsay'
import figlet from 'figlet';


console.log(greet('khoseni'))
console.log(yo('khoseni'))

const styleMessage = chalk.bgRed.whiteBright(greet('Khoseni'))


console.log(chalk.bgRed.whiteBright(greet('khoseni')))

console.log(chalk.bgCyan.whiteBright(cowsay.say({
    text: greet('khoseni')
})));

figlet('Hello, Khoseni', function(err,data){
    if (err){
        console.log('something went wrong..');
        console.dir(err);
        return
    }
    console.log(data);
});