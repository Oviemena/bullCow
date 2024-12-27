import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon"


const DIGITS = 4

interface Guess {
  bulls: number
  cows: number
  g: number
}
@Component({
  imports: [CommonModule, FormsModule, MatIconModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  guess = signal<number[]>([])
  answer = signal<number[]>([])
  errorMessage = signal("")
  guessHistory = signal<Guess[]>([])
  success = signal("")
  gameState = signal("init")
  MAX_GUESSES = 10


  constructor() {
    this.resetGame()
  }

  resetGame() {
    this.guess.set([])
    this.guessHistory.set([])
    this.errorMessage.set("")
    this.success.set("")
    this.gameState.set("init")
    while (true) {
      const digits = []
      for (let i = 0; i < DIGITS; i++) {
        digits.push(Math.floor(Math.random() * 10))
      }

      if (digits[0] === 0) {
        continue
      }
      const uniqueDigits = new Set(digits)
      if (uniqueDigits.size === DIGITS) {
        this.answer.set(digits)
        break
      }
    }
    console.log(this.answer())
  }

  trackInput(event: Event, index: number) {
    const value = (event.target as HTMLInputElement).value
    if (value.length === 1 && index < DIGITS - 1) {
      const nextInput = (event.target as HTMLInputElement).nextElementSibling as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    const numberArray = this.guess().slice()
    numberArray[index] = Number(value)

    this.guess.set(numberArray)
  }


  guessNumber() {
    this.errorMessage.set("")

    if (this.guess().some(h => isNaN(h))) {
      this.errorMessage.set("Only numbers are allowed!")
      return
    }
    if (this.guess().length !== DIGITS) {
      this.errorMessage.set("Please enter a 4 digit number")
      return
    }
    if (this.guess()[0] === 0) {
      this.errorMessage.set("The first number must not start with 0")
      return
    }


    if (new Set(this.guess()).size !== DIGITS) {
      this.errorMessage.set("Please enter a number with unique digits")
      return
    }

    const numArray = +this.guess().map(Number).join('')

    if (this.guessHistory().some(h => h.g === numArray)) {
      this.errorMessage.set("You have already guessed this number");
      return;
    }

    const [bulls, cows] = this.playGame(this.guess(), this.answer())
    this.guessHistory.update(h => {
      h.push({ bulls, cows, g: numArray });
      return h;
    })




    if (this.guessHistory().length > this.MAX_GUESSES) {
      this.success.set("You lost!")
      this.gameState.set("lost")
    }


  }

  playGame(guess: number[], answer: number[]) {

    let bulls = 0
    let cows = 0

    for (let i = 0; i < DIGITS; i++) {
      if (guess[i] === answer[i]) {
        bulls++
      } else if (answer.includes(guess[i])) {
        cows++
      }
    }

    if (bulls === DIGITS) {
      this.success.set("Congratulations!!!You won the game!")
      this.gameState.set("won")
    }

    return [bulls, cows]
  }


  getBullColor(guess: string, index: number): string {
    const guessArray = guess.split('').map(Number);
    const answerArray = this.answer();
    return guessArray[index] === answerArray[index] ? 'green' : 'red';
  }

  seeAnswer() {
    return this.answer()
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text');
    if (pasteData && /^\d{4}$/.test(pasteData)) {
      for (let i = 0; i < 4; i++) {
        this.guess()[i] = Number(pasteData[i]);
      }
    } else {
      this.errorMessage.set('Please paste a 4-digit number without repeating digits.');
    }
  }

  showCow(
    guess: number[],
    index: number
  ) {
    const answer = this.answer()
    return answer.includes(guess[index]) && guess[index] !== answer[index]
  }


}
