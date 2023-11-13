package pkg

import (
	"fmt"
	"image"
	"image/png"
	"io"
	"math"

	openssl "github.com/Luzifer/go-openssl/v4"
)

func EncodeToImage(inputFileData []uint8, inputFileName *string, password *string, outWriter io.Writer) error {
	if inputFileName == nil {
		return fmt.Errorf("inputFileName is nil")
	}
	fileNameArray := []uint8(*inputFileName)

	toEncodeArray := make([]uint8, 4, len(inputFileData)+len(fileNameArray)+4)
	// JS' Uint32Array conversion to Uint8Array go in this direction
	toEncodeArray[0] = uint8(len(fileNameArray) & 0xFF)
	toEncodeArray[1] = uint8(len(fileNameArray) >> 8 & 0xFF)
	toEncodeArray[2] = uint8(len(fileNameArray) >> 16 & 0xFF)
	toEncodeArray[3] = uint8(len(fileNameArray) >> 24 & 0xFF)
	toEncodeArray = append(toEncodeArray, fileNameArray...)
	toEncodeArray = append(toEncodeArray, inputFileData...)

	if password != nil && len(*password) > 0 {
		o := openssl.New()
		encoded, err := o.EncryptBytes(*password, toEncodeArray, openssl.BytesToKeyMD5)
		if err != nil {
			return err
		}
		toEncodeArray = encoded
	}

	toEncodeArrayLength := len(toEncodeArray)

	pixelsCount := toEncodeArrayLength / 3
	if pixelsCount%3 != 0 {
		pixelsCount += 1
	}
	squareSideSize := int(math.Ceil(math.Sqrt(float64(pixelsCount))))

	outImage := image.NewNRGBA(image.Rect(0, 0, squareSideSize, squareSideSize))

	outImage.Pix[0] = uint8(toEncodeArrayLength >> 24 & 0xFF)
	outImage.Pix[1] = uint8(toEncodeArrayLength >> 16 & 0xFF)
	outImage.Pix[2] = uint8(toEncodeArrayLength >> 8 & 0xFF)
	outImage.Pix[3] = 255
	outImage.Pix[4] = uint8(toEncodeArrayLength & 0xFF)
	outImage.Pix[7] = 255
	for i := 0; i < toEncodeArrayLength; i++ {
		// offset of 5 bytes for the length of the file name
		currentPixel := (i + 5) / 3       // current pixel index
		currentPixelOffset := (i + 5) % 3 // color of the pixel to edit
		outImage.Pix[currentPixel*4+currentPixelOffset] = toEncodeArray[i]

		// If a new pixel is used, set the alpha channel to 255
		if currentPixelOffset == 0 {
			outImage.Pix[currentPixel*4+3] = 255
		}
	}

	err := png.Encode(outWriter, outImage)
	return err
}
