const loadImageData = require('../mnist-loader/image-loader.js')
const loadLabelData = require('../mnist-loader/label-loader.js')
const NeuralNetwork = require('./neuralnet.js')
const { matrix, mean, abs, subtract } = require('mathjs')
const fs = require('fs')

/**
 * Quick little training script that also saves the weights from the trained network.
 */
async function train() {
  const nn = new NeuralNetwork(784, 128, 64, 32, 10)
  const images = await loadImageData()
  const _labels = await loadLabelData()
  const labels = _labels.map((label) => {
    let a = new Array(10).fill(0)
    a[label] = 1
    return a
  })

  console.log('Beginning training...')
  for (let i = 0; i < 60000; i += 1000) {
    let error = nn.train(matrix(images.slice(i, i + 1000)), matrix(labels.slice(i, i + 1000)))
    console.log(`Error at ${i + 1000} samples: ${mean(abs(error))}`)
  }
  console.log('End training.')

  const stream = fs.createWriteStream('nn/weights.js')
  stream.once('open', (fd) => {
    stream.write('module.exports = ')
    stream.write(JSON.stringify(nn.weights.map(weight => weight._data)))
    stream.close()
  })

  /*const trainedWeights = require('./weights.js')
  const weights = trainedWeights.map((weight) => matrix(weight))
  nn.setWeights(weights)*/

  console.log('Beginning testing.')
  const testImages = await loadImageData('t10k-images-idx3-ubyte')
  const _testLabels = await loadLabelData('t10k-labels-idx1-ubyte')
  const testLabels = _testLabels.map((label) => {
    let a = new Array(10).fill(0)
    a[label] = 1
    return a
  })

  let predictions = nn.predict(matrix(testImages.slice(0, 10)))
  console.log(predictions)
  let error = subtract(testLabels.slice(0, 10), predictions)
  console.log(`Error rate: ${mean(abs(error))}`)
}

train()

