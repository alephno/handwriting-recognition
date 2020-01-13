/* ------------------------- LABEL FILE FORMAT --------------------------- */
/*
 * File starts with a magic number, which is a 32 bit int with the value 2049
 * Then the number of labels, which is also a 32 bit int
 * Then the labels as unsigned bytes
 *
 * [offset] [type]      [value]       [descr]
 *  0000     32bit Int   2049          magic number
 *  0004     32bit Int   60000         Number of labels
 *  0008     u8          .             Label
 *  nnnn     u8          .             Label
*/

/**
 * Loads MNIST handwritten labels from a specified path.
 *
 * @param {String} filePath path to the label dataset.
 * @returns {Array} The labels as an array of numbers.
 */
async function loadLabelData(filePath = 'train-labels.idx1-ubyte') {
  const fs = require('fs').promises
  const MAGIC_NUMBER = 2049

  const handle = await fs.open(filePath, 'r+')
  const buffer = await handle.readFile({ enconding: 'utf8' })
  await handle.close()

  const magicNum =buffer.readInt32BE(0)
  if (magicNum != MAGIC_NUMBER) {
    throw new Error(`Expected magic number to equal ${MAGIC_NUMBER} but read ${magicNum} from file.`)
  }

  // not needed for my purposes
  // const count = buffer.readInt32BE(4)

  // skip the magic number and count
  const labels = [...buffer.slice(8)]

  return labels
}

module.exports = loadLabelData