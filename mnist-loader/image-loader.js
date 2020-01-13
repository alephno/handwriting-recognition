/* ------------------------- IMAGE FILE FORMAT --------------------------- */
/*
 * File starts with a magic number, which is a 32 bit int with the value 2051
 * Then the number of images as a 32 bit int
 * Then the number of rows as a 32 bit int
 * Then the number of columns as a 32 but int
 * Then the pixels as unsigned bytes
 *
 * Pixels are encoded row-wise with 0 being white and 255 being black
 *
 * [offset] [type]      [value]       [descr]
 *  0000     32bit Int   2051          magic number
 *  0004     32bit Int   60000         Number of labels
 *  0008     32bit Int   28            Number of rows
 *  0012     32bit Int   28       .    Number of columns
 *  nnnn     u8          ..            Pixels
*/

/**
 * Loads MNIST handwritten digit images from a specified path.
 * The images are in grayscale which each pixel being a value between 0 and 255.
 * 0 is white and 255 is black.
 *
 * @param {String} filePath path to the image dataset.
 * @param {Boolean} flatten Return images as a vector instead of a matrix. Defaults to true.
 * @returns The images as arrays of bytes where each byte represents a pixel.
 */
async function loadImageData(filePath = 'train-images.idx3-ubyte', flatten=true) {
  const fs = require('fs').promises
  const MAGIC_NUMBER = 2051

  const handle = await fs.open(filePath, 'r+')
  const buffer = await handle.readFile({ enconding: 'utf8' })
  await handle.close()

  const magicNum =buffer.readInt32BE(0)
  if (magicNum != MAGIC_NUMBER) {
    throw new Error(`Expected magic number to equal ${MAGIC_NUMBER} but read ${magicNum} from file.`)
  }

  const count = buffer.readInt32BE(4)
  const rows = buffer.readInt32BE(8)
  const cols = buffer.readInt32BE(12)

  // skip the metadata by startig at index 16
  let images = buffer.slice(16).reduce((images, pixel, index) => {
    const imageIndex = Math.floor(index / (rows * cols))
    const localIndex = index - (imageIndex * (rows * cols))
    const row = Math.floor(localIndex / 28)
    //const col = localIndex - (row * 28)

    if (!images[imageIndex]) images.push([])

    if (flatten) {
      images[imageIndex].push(pixel)
    } else {
      if (!images[imageIndex][row]) images[imageIndex].push([])
      images[imageIndex][row].push(pixel)
    }

    return images
  }, [])

  return images
}

module.exports = loadImageData