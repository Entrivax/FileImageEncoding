package main

import (
	"flag"
	"fmt"
	"image-file-encoding/pkg"
	"io"
	"os"
	"path/filepath"
)

func main() {
	var (
		output   = flag.String("o", "./", "output directory")
		mode     = flag.String("m", "", "mode: encode/decode")
		password = flag.String("p", "", "password")
	)
	flag.Parse()
	inputFiles := flag.Args()

	switch *mode {
	case "encode":
		{
			for _, inputFile := range inputFiles {
				fmt.Printf("Encoding %s\n", inputFile)
				file, err := os.Open(inputFile)
				if err != nil {
					fmt.Printf("Error opening file %s: %s\n", inputFile, err)
					continue
				}
				defer file.Close()
				fileName := filepath.Base(inputFile)
				outPath := filepath.Join(*output, fileName+".png")
				outFile, err := os.Create(outPath)
				if err != nil {
					fmt.Printf("Error creating file %s: %s\n", outPath, err)
					continue
				}
				inputFileData, err := io.ReadAll(file)
				if err != nil {
					fmt.Printf("Error reading file %s: %s\n", inputFile, err)
					continue
				}
				err = pkg.EncodeToImage(inputFileData, &fileName, password, outFile)
				if err != nil {
					fmt.Printf("Error encoding file %s: %s\n", inputFile, err)
					continue
				}
				err = outFile.Close()
				if err != nil {
					fmt.Printf("Error closing file %s: %s\n", outPath, err)
					continue
				}
				fmt.Printf("Finished encoding file to %s\n", outPath)
			}
			break
		}
	case "decode":
		{
			for _, inputFile := range inputFiles {
				fmt.Printf("Decoding %s\n", inputFile)
				file, err := os.Open(inputFile)
				if err != nil {
					fmt.Printf("Error opening file %s: %s\n", inputFile, err)
					continue
				}
				defer file.Close()
				filename, data, err := pkg.DecodeFromImage(file, password)
				if err != nil {
					fmt.Printf("Error decoding file %s: %s\n", inputFile, err)
					continue
				}
				outPath := filepath.Join(*output, *filename)
				outFile, err := os.Create(outPath)
				if err != nil {
					fmt.Printf("Error creating file %s: %s\n", outPath, err)
					continue
				}
				_, err = outFile.Write(data)
				if err != nil {
					fmt.Printf("Error writing file %s: %s\n", outPath, err)
					continue
				}
				outFile.Close()
			}
			break
		}
	default:
		{
			flag.Usage()
			return
		}
	}
}
