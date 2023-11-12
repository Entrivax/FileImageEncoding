BUILD_DIR := $(CURDIR)/bin

.PHONY: all build clean

all: build

build:
	@echo "Building..."
	go build -o $(BUILD_DIR)/ image-file-encoding/cmd/image-file-encoding
	@echo "Done."

clean:
	@echo "Cleaning..."
	rm -rf $(BUILD_DIR)
	@echo "Done."