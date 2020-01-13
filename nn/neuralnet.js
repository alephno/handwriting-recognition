const {random, multiply, dotMultiply, add, subtract, transpose} = require('mathjs')

class NeuralNetwork {
  /**
   *  Creates a neural network with layer sizes specified. The first size
   *  given is the input layer, the last size given is the output layer, and
   *  all other sizes are for hidden layers.
   *
   *  E.g. new NeuralNetwork(2, 3, 1) would create a new neural network with an
   *  input layer of size 4, a hidden layer with size 3, and an output layer of
   *  size 1.
   *
   * @param  {...number} args Sizes of layers.
   */
  constructor(...args) {
    this.weights = []
    for (let i = 0; i < args.length - 1; i++) {
      this.weights[i] = random([args[i], args[i + 1]], -1.0, 1.0)
    }

    this.activation = (value, deriv) => {
      const fx = 1 / (1 + Math.exp(-value))
      return deriv ? fx * (1 - fx): fx
    }
    this.lr = .0001
  }

  setWeights(weights) {
    this.weights = weights
  }

  /**
   * Train the neural network with the given inputs and targets.
   *
   * @param {*} input Input layer or several input layers as a matrix.
   * @param {*} target Target output or several target outputs as a matrix.
   * @returns {*} Outputs as a matrix
   */
  train(input, target) {
  //for (let i = 0; i < this.epochs; i++) {
    let activations = []
    const outputs = this.weights.reduce((_input, weights) => {
      const activation = multiply(_input, weights).map(e => this.activation(e, false))
      activations.push(activation)
      return activation
    }, input)

    let prevDelta = null
    let outputError = null
    for (let j = this.weights.length - 1; j >= 0; j--) {
      if (j === this.weights.length - 1) {
        const error = subtract(target, outputs)
        outputError = error
        const delta = dotMultiply(error, outputs.map(v => this.activation(v, true)))
        this.weights[j] = add(this.weights[j], multiply(transpose(activations[j - 1]), multiply(delta, this.lr)))
        prevDelta = delta
      } else {
        const _input = (j === 0) ? input : activations[j - 1]
        const error = multiply(prevDelta, transpose(this.weights[j + 1]))
        const delta = dotMultiply(error, activations[j].map(v => this.activation(v, true)))
        this.weights[j] = add(this.weights[j], multiply(transpose(_input), multiply(delta, this.lr)))
        prevDelta = delta
      }
    }

    return outputError

      //if (i % 10 == 0) console.log(`Error: ${mean(abs(outputError))}`)

    //}
  }

  /**
   * Get a prediction or predictions for an input or inputs.
   *
   * @param {*} input Input or inputs to get a prediction for.
   * @returns Confidence levels for all possible outputs.
   */
  predict(input) {
    return this.weights.reduce((_input, weights) => multiply(_input, weights).map(e => this.activation(e, false)), input)
  }
}

module.exports = NeuralNetwork