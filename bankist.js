"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-12-05T07:31:17.178Z',
    '2022-12-06T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2022-12-01T10:17:24.185Z',
    '2022-11-10T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'tl-PH',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const convertDate = function(date,withTime = false){
  // const year   = date.getFullYear();
  // const month  = `${date.getMonth() + 1}`.padStart(2, 0); 
  // const day    = `${date.getDate()}`.padStart(2, 0);
  // const hour   = `${date.getHours()}`.padStart(2, 0);
  // const min    = `${date.getMinutes()}`.padStart(2, 0);
  // const defaultDate = date.textContent = `${month}/${day}/${year}`;
  // const dateWithTime = date.textContent = `${month}/${day}/${year}, ${hour}:${min}`;
  const options = { 
    hour:'numeric', 
    minute:'numeric',
    day:'numeric',
    month:'numeric',
    // month:'2-digit',
    // month:'long',
    year:'numeric'
  }
  const locale = navigator.language;
  // console.log(locale);
  return new Intl.DateTimeFormat(currentAccount.locale,options).format(date);
  // return withTime ? dateWithTime : defaultDate;
}
const formatMovementDates = function(date){
  const dayPassed =  Math.round(Math.abs(date - new Date()) / (1000 * 60 * 60 * 24));
  if(dayPassed === 0){
    return 'Today';
  }else if(dayPassed === 1){
    return 'Yesterday';
  }else if(dayPassed <= 7){
    return `${dayPassed} days ago `
  }
  return new Intl.DateTimeFormat(currentAccount.locale).format(date);
}

const formatAmount = function(amount,acc){
  return new Intl.NumberFormat(acc.locale,{style:'currency', currency:acc.currency}).format(amount)
}


const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const sortMovements = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  sortMovements.forEach(function (mov, index) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    
    const date = new Date(acc.movementsDates[index]);
    // const year = date.getFullYear();
    // const month = `${date.getMonth() + 1}`.padStart(2, 0); 
    // const day = `${date.getDate()}`.padStart(2, 0);
    const displayDate = formatMovementDates(date);
    const formattedMov = formatAmount(mov,acc);
    const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formattedMov}</div>
        </div>
      `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayPrintBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, mov) => accu + mov, 0);
  const formattedMov = formatAmount(acc.balance,acc);
  labelBalance.textContent = formattedMov;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((accu, mov) => accu + mov);
  // labelSumIn.textContent = Math.abs(incomes).toFixed(2);
  const formattedSumIn = formatAmount(incomes,account);
  labelSumIn.textContent = formattedSumIn;
  const outcomes = account.movements
    .filter((mov) => mov < 0)
    .reduce((accu, mov) => accu + mov);
  const formattedSumOut = formatAmount(outcomes,account);
  labelSumOut.textContent = formattedSumOut;
  // labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)}$`;

  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((accu, interest) => accu + interest);
  const formattedSumInterest = formatAmount(interest,account);
  labelSumInterest.textContent = formattedSumInterest;
  // labelSumInterest.textContent = `${Math.abs(outcomes).toFixed(2)}$`;
  // console.log(interest);
};

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((word) => word.at(0))
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (currentAccount) {
  displayMovements(currentAccount);
  calcDisplayPrintBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

let currentAccount, timer;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  console.log('clicked');
  currentAccount = accounts.find(
    (account) => account.username.toLowerCase() === inputLoginUsername.value.toLowerCase()
  );
  console.log(currentAccount);
  console.log(inputLoginPin);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log("LOGIN");
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner
      .split(" ")
      .at(0)}`;

    containerApp.style.opacity = 100;

    inputLoginUsername.value = inputLoginPin.value = "";

    inputLoginPin.blur();
    labelDate.textContent = convertDate(new Date());
    /** TIMER */
    if(timer){
      clearInterval(timer);
    }
    timer = startLogoutTimer();
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value.toLowerCase()
  );
  const amount = Number(inputTransferAmount.value);

  //Check if input value is greater than > 0 DONE
  //Check if the transfer is not on self
  //Check if Receiver existed
  //Check if the amount is greater that or equal the amount
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    /** RESET TIMER */
    clearInterval(timer);
    timer = startLogoutTimer();
  }

  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferAmount.blur();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  const request = currentAccount.movements.some((mov) => mov >= amount * 0.1);
  if (amount > 0 && request) {
    //Add movement to current account
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);

    /** RESET TIMER */
    clearInterval(timer);
    timer = startLogoutTimer();
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value.toLowerCase() === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username.toLowerCase() === currentAccount.username.toLowerCase()
    );
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
    /** RESET TIMER */
    clearInterval(timer);
    timer = startLogoutTimer();
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
  /** RESET TIMER */
  clearInterval(timer);
  timer = startLogoutTimer();
});
// Includes = Equality

// Some = Check if some  of the value pass the test

// Every = Check if all of the value pass the test

// Seperate callback
// const deposit = (mov) => mov > 0;

// console.log(movements.some(deposit));
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// Flat  flat the multi dimensional array to one array ONE OR MORE
// console.log(arr.flat());

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// Flat  flat the multi dimensional array to one array
// console.log(arrDeep.flat(2));

// const accountMovements = accounts.map((acc) => acc.movements);
// console.log(accountMovements);

// const allMovements = accountMovements.flat();
// console.log(allMovements);

// const overAllBalance = allMovements.reduce((acc, mov) => acc + mov, 0);

// Flat
const overAllBalance = accounts
  .map((acc) => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);

// console.log(overAllBalance);

// FlatMap 1 LEVEL DEEP

const overAllBalance2 = accounts
  .flatMap((acc) => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);

// console.log(overAllBalance2);

// SORT
// Strings
const owners = ["Jonas", "Stewart", "Kevin", "Josh"];
console.log(owners.sort());
console.log(owners);

//Numbers
// console.log(movements);
//return < 0 , A , B ( keep order)
// return > 0 B. A ( switch order)

//ASCENDING
// movements.sort((a, b) => {
//   if (a > b) {
//     return 1;
//   } else {
//     return -1;
//   }
// });
movements.sort((a, b) => a - b);
// console.log(movements);
//DESCENDING
// movements.sort((a, b) => {
//   if (a > b) {
//     return -1;
//   } else {
//     return 1;
//   }
// });
movements.sort((a, b) => b - a);
// console.log(movements);

// CREATE A ARRAY LIKE TO AN ARRAY USING ARRAY FROM
const arr1 = [1, 2, 3, 4, 5, 6];
const x = new Array(7);
console.log(x);
// x.fill(1);
x.fill(1, 3, 5);
console.log(x);
arr1.fill(23, 4, 6);
console.log(arr1);

const y = Array.from({ length: 7 }, () => 1);

const z = Array.from({ length: 100 }, (_, i) => i + 1);

console.log(z);

labelBalance.addEventListener("click", function () {
  const movementsUI = Array.from(
    document.querySelectorAll(".movements__value"),
    (elem) => Number(elem.textContent.replace("$", ""))
  );
  // console.log(movementsUI);
  const movementsUI2 = [...document.querySelectorAll(".movements__value")];
  const shit = movementsUI2.map((elem) =>
    Number(elem.textContent.replace("$", ""))
  );
  // console.log(shit);
});

// REDUCE METHOD USES
// #1
const accountsDepositAmount = accounts
  .flatMap((account) => account.movements)
  .filter((mov) => mov > 0)
  .reduce((accu, amo) => accu + amo, 0);
console.log(accountsDepositAmount);

// const accountDespositAmountReduce = accounts
//   .flatMap((account) => account.movements)
//   .reduce((accu, mov) => (mov > 0 ? accu + mov : accu), 0);
// console.log(accountDespositAmountReduce);

// // #2
// // Count Array Length
// const countArrayLength = accounts
//   .flatMap((account) => account.movements)
//   .filter((mov) => mov > 0).length;
// console.log(countArrayLength);

// const countArrayLength1 = accounts
//   .flatMap((account) => account.movements)
//   .reduce((count, cur) => (cur > 0 ? ++count : count), 0);
// // .reduce((count, mov) => (mov > 0 ? count++ : count),0);
// console.log(countArrayLength1);

// #3
// const { deposits, withdrawals } = accounts
//   .flatMap((account) => account.movements)
//   .reduce(
//     (sum, cur) => {
//       // cur > 0 ? (sum.deposits += cur) : (sum.withdrawals += cur);
//       sum[cur > 0 ? "deposits" : "withdrawals"] += cur;
//       return sum;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// #4
// const convertTitleCase = function (title) {
//   const exceptions = ["a", "an", "the", "but", "or", "on", "in", "with", "and"];
//   const capitalize = (str) => str.at(0).toUpperCase() + str.slice(1);
//   const titleCase = title
//     .toLowerCase()
//     .split(" ")
//     .map((word) => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(" ");
//   return capitalize(titleCase);
// };

// console.log(convertTitleCase("this is a nice title or a good parahraph"));
// console.log(convertTitleCase("a oh my god brody with an slut"));


/** CODING CHALLENGE  */
 //DATA 
   const dogs = [
    {weight:22, curFood:250, owners:['Alice', 'Bob']},
    {weight:8, curFood:200, owners:['Matilda']},
    {weight:13, curFood:275, owners:['Sarah','John']},
    {weight:32, curFood:340, owners:['Michael']}
  ] 
  // 1
  dogs.forEach(function(dog) {
    dog.recommendedFood = Math.trunc((dog.weight ** 0.75) * 28)
  });
  // 2
  const sarahDog = dogs.find(dog => dog.owners.includes('Sarah'));
  console.log(`Sarah's dog is eating too ${sarahDog.curFood > sarahDog.recommendedFood ? 'much' : 'little'}`);
 
  // 3
  const ownersEatTooMuch = dogs.filter(dog => dog.curFood > dog.recommendedFood ).flatMap(dog => dog.owners);
  console.log(ownersEatTooMuch);

  const ownersEatTooLittle = dogs.filter(dog => dog.curFood < dog.recommendedFood ).flatMap(dog => dog.owners);
  console.log(ownersEatTooLittle);

  //4
  console.log(`${ownersEatTooMuch.join(' and ')} dog's eat too much!`);
  console.log(`${ownersEatTooLittle.join(' and ')} dog's eat too little!`);
 

  //5
  console.log(`${dogs.some(dog => dog.curFood === dog.recommendedFood)}`);

  //6
  const checkEatingOkay = dog => dog.curFood > dog.recommendedFood * 0.9 && dog.curFood < dog.recommendedFood * 1.1;

  //7 
  console.log(dogs.filter(checkEatingOkay));

  //8
  const dogsSorted = dogs.slice().sort((a,b) => a.recommendedFood - b.recommendedFood );
  
  console.log(dogsSorted);


  
  // const data = [
  //   {
  //     amount:100,
  //     created_at:"09-01-24"
  //   },
  //   {
  //     amount:100,
  //     created_at:"09-01-24"
  //   },
  //   {
  //     amount:400,
  //     created_at:"09-01-22"
  //   },
  //   {
  //     amount:100,
  //     created_at:"09-01-23"
  //   },
  //   {
  //     amount:200,
  //     created_at:"09-01-23"
  //   },
  //   {
  //     amount:300,
  //     created_at:"09-01-22"
  //   },
  //   {
  //     amount:300,
  //     created_at:"09-01-25"
  //   },
  // ];
  // #1 Make date unique
  // const uniqueDates =  [...new Set(data.map(row => row.created_at))];
  // console.log(uniqueDates);
  // const newData = uniqueDates.map(date=>({
  //   amount:data.filter(row => row.created_at === date).map(row => row.amount).reduce((accu, mov) => accu + mov,0),
  //   created_at:date
  // }))
  // console.log(newData);

//   for(let i = 1; i <= 10; i++)
// {
//     let row = "7 * " + i + " = " + 7 * i;
//     console.log(row);
// }

// for(let i = 1; i <= 100; i += 2)
// {
//   console.log(i);
// }

// let sum = 0;

// for(let i = 1; i <= 10; i++)
// {
//     sum += i;
// }

// console.log(sum);


// const numbersData = [100,-100,350,-50,-200];

// const filterNumber = numbersData.filter(num => num > 0);
// const filterData = (numbers) => numbers.filter(num => num > 0);
// console.log(filterData(numbersData));
// console.log(filterNumber);

  /** Numbers Dates, Global Initialize and Timers */

  //Conversion
  console.log(Number('23'));
  console.log(+'23');

  //Parsing
  console.log(Number.parseInt('30px',10));
  console.log(Number.parseInt('e23',10));

  console.log(Number.parseInt(' 2.5 rem '));
  console.log(Number.parseFloat(' 2.5 rem '));
  
  // Check if value is NaN
  console.log(Number.isNaN(20));
  console.log(Number.isNaN('20'));
  console.log(Number.isNaN(+'20X'));
  console.log(Number.isNaN(23/0));
  
  //Checking if value is a number for FLOATING VALUE
  console.log(Number.isFinite(23/0));
  console.log(Number.isFinite('20'));
  console.log(Number.isFinite(+'20X'));
  console.log(Number.isFinite(23/0));

  //Check if value is a integer 
  console.log(Number.isInteger(23));
  console.log(Number.isInteger(23.0));
  console.log(Number.isInteger(23 / 0));

  // MATH
  console.log(Math.sqrt(25));
  console.log(25 ** ( 1 / 2) );
  console.log(8 ** ( 1 / 3) );

  console.log(Math.max(5,18,23,11,2));
  console.log(Math.max(5,18,'23',11,2));
  console.log(Math.max(5,18,'23px',11,2));
  
  console.log(Math.min(5,18,23,11,2));

  console.log(Math.PI * Number.parseFloat('10px') ** 2);
  console.log(Math.trunc(Math.random() * 6) +1 );
  
  const randomInt = (min,max) => Math.trunc(Math.random() * (max-min) + 1) +min;
  
  console.log(randomInt(10,20));

  //Rounding integers
  console.log(Math.trunc(23.3));

  console.log(Math.round(23.3));
  console.log(Math.round(23.9));

  console.log(Math.ceil(23.3));
  console.log(Math.ceil(23.9));

  console.log(Math.floor(23.3));
  console.log(Math.floor(23.9));

  console.log(Math.trunc(-23.3));
  console.log(Math.floor(-23.9));

  //Rounding decimals
    // Returns to string
  console.log((2.7).toFixed(0));
  console.log((2.7).toFixed(3));
  console.log((2.345).toFixed(2));
  console.log(+(2.345).toFixed(2));

  const isEven = num => num % 2 === 0;

  console.log(isEven(22));
  // const now = new Date();
  // const year = now.getFullYear();
  // const month = `${now.getMonth()+1}`.padStart(2, 0) ; 
  // const day = `${now.getDate()}`.padStart(2, 0);
  // const hour = now.getHours();
  // const min = now.getMinutes();
  // labelDate.textContent = convertDate(now,true);
  
  // labelBalance.addEventListener('click',function(){
  //   console.log('clicked');
  //   [...document.querySelectorAll('.movements__row')].forEach((mov,index) => {
  //     if(index % 2 == 0 ){
  //       mov.style.backgroundColor = 'red';
  //     }
  //     if(index % 3 == 0 ){
  //       mov.style.backgroundColor = 'blue';
  //     }
  //   });
  // })

  /** NUMERIC SEPERATOR FOR BETTER READING */
  // const diameter = 287_460_000_000;
  // const priceWithCents = 389_23;
  // console.log(diameter);
  // console.log(priceWithCents);


  /** CALCULATING DATES WITH ONE TO THE OTHER */

  // const future = new Date(2023,11,6);
  // console.log(+future);

  // const dayPassed = (date1,date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

  // const datePassed = dayPassed(new Date(2023,11,7),new Date(2023,11,5));

  // console.log(datePassed);

  /** DATETIME FORMAT INTERNATILIZATION API */
//   currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// const newDate = new Date();
// const options = { 
//   hour:'numeric', 
//   minute:'numeric',
//   day:'numeric',
//   month:'long',
//   // month:'2-digit',
//   // month:'long',
//   year:'numeric'
// }
// const locale = navigator.language;
// // console.log(locale);
// labelDate.textContent = new Intl.DateTimeFormat(locale,options).format(newDate);


/** NUMBER FORMAT INTERNALIZATION */

// const num = 67820241.23;

// const options = {
//   style:"currency",
//   // style:"unit",
//   // style:"percent",
//   unit:'mile-per-hour',
//   currency:'EUR',
// }
// console.log(new Intl.NumberFormat('en-US',options).format(num));
// console.log(new Intl.NumberFormat('en-GB',options).format(num));
// console.log(new Intl.NumberFormat('ar-SY',options).format(num));
// console.log(new Intl.NumberFormat('de-DE',options).format(num));


/** SET TIMEOUT CLEARTIME OUT  */
// const ingredients = ['onion','potato'];
// const pizza = setTimeout((ing1,ing2)=> console.log(`Surpise MF You have ${ing1} and ${ing2}`),3000,...ingredients);

// if(ingredients.includes('onion')){
//   clearTimeout(pizza);
//   console.log('Gotcha Btch');
// }

// console.log(pizza);

const startLogoutTimer = function(){
  let time = 300;
  const tick = function(){
    const min = String(Math.trunc(time / 60)).padStart(2,0); 
    const sec = String(Math.trunc(time % 60)).padStart(2,0); 
    labelTimer.textContent = `${min}:${sec}`;
    if(time === 0){
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  }
  tick();
  const timer = setInterval(tick,1000)
  return timer;
}