package pkg

import (
	"fmt"
	"image"
	"image/png"
	"io"

	openssl "github.com/Luzifer/go-openssl/v4"
)

func DecodeFromImage(inputImageStream io.Reader, password *string) (filename *string, data []uint8, err error) {
	img, err := png.Decode(inputImageStream)
	if err != nil {
		return nil, nil, err
	}
	switch img := img.(type) {
	case *image.NRGBA:
		{
			length := int(img.Pix[0])<<24 | int(img.Pix[1])<<16 | int(img.Pix[2])<<8 | int(img.Pix[4])
			data := make([]uint8, length)
			for i := 0; i < length; i++ {
				currentPixel := (i + 5) / 3
				currentPixelOffset := (i + 5) % 3
				data[i] = img.Pix[currentPixel*4+currentPixelOffset]
			}
			if password != nil && len(*password) > 0 {
				o := openssl.New()
				decoded, err := o.DecryptBytes(*password, data, openssl.BytesToKeyMD5)
				if err != nil {
					return nil, nil, err
				}
				data = decoded
			}
			filenameLength := int(data[3])<<24 | int(data[2])<<16 | int(data[1])<<8 | int(data[0])
			filename := string(data[4 : filenameLength+4])
			return &filename, data[filenameLength+4:], nil
		}
	default:
		{
			return nil, nil, fmt.Errorf("unknown image type")
		}
	}
}
