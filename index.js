"use strict";

class Conversion {
    constructor(expression, newState) {
        this.expression = expression
        this.newState = newState
    }
}

// Conversions
const conversionTable = {
    0: [
        new Conversion(/^[a-zA-Z]/, 7),
        new Conversion(/^[(]/, 8),
        new Conversion(/^[)]/, 9),
        new Conversion(/^[,]/, 10),
        new Conversion(/^[+*/^-]/, 6),
        new Conversion(/^[0-9]/, 1)
    ],
    1: [
        new Conversion(/^[0-9]/, 1),
        new Conversion(/^[.]/, 2),
        new Conversion(/^[eE]/, 3)
    ],
    2: [
        new Conversion(/^[0-9]/, 2),
        new Conversion(/^[eE]/, 3)
    ],
    3: [
        new Conversion(/^[+-]/, 4),
        new Conversion(/^[0-9]/, 5)
    ],
    4: [
        new Conversion(/^[0-9]/, 5)
    ],
    5: [
        new Conversion(/^[0-9]/, 5)
    ],
    7: [
        new Conversion(/^[0-9a-zA-Z]/, 7)
    ]
}

// Tokens
const tokenTable = {
    1: 'number',
    2: 'number',
    5: 'number',
    6: 'operator',
    7: 'id',
    8: 'lparen',
    9: 'rparen',
    10: 'comma'
}

// Returns state with given state and character
function getNewState(currentState, char) {
    let newState = null

    if (conversionTable[currentState] == null) { return null }

    conversionTable[currentState].forEach(conv => {
        if (conv.expression.test(char)) {
            newState = conv.newState
        }
    })
    return newState
}
// Returns token with given state or undefined
function getToken(state) {
    return tokenTable[state]
}

// Iterates over string chars, analizes the sequence
function analyze(str) {
    function createResultRecord() {
        resultsArr.push(`(${getToken(currentState)}, ${tokenString})`)
    }
    const initStrArr = str.trim().split("")

    // Array contains previous states. Used to go back if sequence failed
    let statesBuffer = []
    let currentState = 0
    let tokenString = ""
    let resultsArr = [] // Results array in format ["(number, 2)", (id, asd), ...]
    
    for(let index = 0; index < initStrArr.length; index++) {
        function iterateBack(extraIndex = 0) {
            let prevStep = 1
                let revercedBufferArr = statesBuffer.slice(1).reverse()
 
                // From the end of buffered states iterate and find first successful state
                while(
                    !getToken(revercedBufferArr[prevStep]) 
                    && prevStep <= revercedBufferArr.length) {
                    prevStep += 1
                }

                // Set params to last known successfull state
                currentState = revercedBufferArr[prevStep]
                tokenString = tokenString.substr(0, tokenString.length - prevStep)
                createResultRecord()
                tokenString = ""
                currentState = 0
                index -= prevStep + 1 - extraIndex
        }

        const char = initStrArr[index]
        const newState = getNewState(currentState, char)
        statesBuffer.push(currentState)

        if (char == " ") { continue; }
        
        if (newState) {
            currentState = newState
            tokenString += char
        } else {
            if (!tokenTable[currentState]) {
                iterateBack(); continue;
            }
            createResultRecord()
            tokenString = char
            currentState = 0
            currentState = getNewState(currentState, char)
        }
        
        if(index === initStrArr.length - 1) {
            if(getToken(currentState)) {
                createResultRecord()
            } else {
                statesBuffer.push(currentState)
                iterateBack(1)
            }
        }
    }
    return resultsArr.join("; ")    
}

let output = analyze("123e+")
console.log(output)

console.assert(analyze('667.22') == '(number, 667.22)')
console.assert(analyze('22.18E+10') == '(number, 22.18E+10)')
console.assert(analyze('37e-99') == '(number, 37e-99)')
console.assert(analyze('40.') == '(number, 40.)')
console.assert(analyze('362e+80') == '(number, 362e+80)')
console.assert(analyze('2.010') == '(number, 2.010)')
console.assert(analyze('35E+35') == '(number, 35E+35)')
console.assert(analyze('53.353e-13') == '(number, 53.353e-13)')
console.assert(analyze('9') == '(number, 9)')
console.assert(analyze('+') == '(operator, +)')
console.assert(analyze('*') == '(operator, *)')
console.assert(analyze('/') == '(operator, /)')
console.assert(analyze('^') == '(operator, ^)')
console.assert(analyze('-') == '(operator, -)')
console.assert(analyze('(') == '(lparen, ()')
console.assert(analyze(')') == '(rparen, ))')
console.assert(analyze(',') == '(comma, ,)')
console.assert(analyze('hm') == '(id, hm)')
console.assert(analyze('ocn4wx') == '(id, ocn4wx)')
console.assert(analyze('o') == '(id, o)')
console.assert(analyze('qkg') == '(id, qkg)')
console.assert(analyze('j8w26h') == '(id, j8w26h)')
console.assert(analyze('gipgb4') == '(id, gipgb4)')
console.assert(analyze('giocqic') == '(id, giocqic)')
console.assert(analyze('qic') == '(id, qic)')
console.assert(analyze('qe2315') == '(id, qe2315)')
console.assert(analyze('123efg') == '(number, 123); (id, efg)')
console.assert(analyze('1+2*3,var') == '(number, 1); (operator, +); (number, 2); (operator, *); (number, 3); (comma, ,); (id, var)')
console.assert(analyze('123e1') == '(number, 123e1)')
console.assert(analyze('123 e1') == '(number, 123e1)')
console.assert(analyze('123e+x') == '(number, 123); (id, e); (operator, +); (id, x)')
console.assert(analyze('123e+') == '(number, 123); (id, e); (operator, +)')