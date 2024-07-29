package utils

import (
	"be/model/model"
	"fmt"
	"os"
	"strings"
	"time"
)

func GetTodayDate() string {
	t := time.Now()
	return t.Format("2006-01-02")
}

func WrapError(msg string, err error) error {
	return fmt.Errorf("%s: %w", msg, err)
}

func FromFilenameToETFData(filename string) model.ETFData {
	// example:
	// IWVL{}MI{}IE00BP3QZB59{}italy{}ishares_msci_world_value_factor_ucits{}2010_01_04{}2021_07_30.json
	// became
	// Ticker: IWVL
	// Exchange: MI
	// Isin: IE00BP3QZB59
	// Country: italy
	// Name: ishares msci world value factor ucits
	// DataFrom: 2010 01-04
	// DataTo: 2021-07-30

	// name
	name := strings.Split(filename, "{}")

	// create ETFData
	etf := model.ETFData{
		Ticker:   name[0],
		Exchange: name[1],
		Isin:     name[2],
		Country:  name[3],
		Name:     name[4],
		DataFrom: name[5],
		DataTo:   strings.Split(name[6], ".")[0],
	}

	return etf
}

func FromETFDataToFilename(etf model.ETFData) (string, error) {

	if etf.DataFrom == "" || etf.DataTo == "" {
		return "", fmt.Errorf("data_from and data_to are required")
	}

	separator := "{}"

	part1 := fmt.Sprintf(
		"%s"+separator+"%s"+separator+"%s"+separator+"%s",
		etf.Ticker,
		etf.Exchange,
		etf.Isin,
		etf.Country,
	)

	part2 := fmt.Sprintf(
		"%s"+separator+"%s"+separator+"%s",
		etf.Name,
		etf.DataFrom,
		etf.DataTo,
	)

	return fmt.Sprintf("%s"+separator+"%s", part1, part2), nil
}

// reads all filenames from folder
// return a slice of strings
func UpdateDownloadedEtfList(downloadedEtfFolder string) ([]string, error) {
	// read all files from folder
	fileNames, err := os.ReadDir(downloadedEtfFolder)
	if err != nil {
		return nil, err
	}
	// create a slice of strings
	slices := make([]string, len(fileNames))
	// iterate over the fileNames
	for i, fileName := range fileNames {
		// append the filename to the slice
		slices[i] = fileName.Name()
	}

	// return the slice
	return slices, nil
}

// delete a file from the downloadedEtfFolder
// return true if the file is deleted
// return false if the file is not deleted (maybe not found)
func DeleteEtfFile(name string, ticker string, exchange string, downloadedEtfFolder string, latestDownloadFilename string) (bool, error) {
	deleted := false

	// get all downloaded etf
	fileNames, err := UpdateDownloadedEtfList(downloadedEtfFolder)
	if err != nil {
		return deleted, err
	}

	// iterate over the fileNames
	for _, fileName := range fileNames {
		// convert the filename to ETFData
		etf := FromFilenameToETFData(fileName)
		// if the name, ticker and exchange are the same
		if etf.Name == name && etf.Ticker == ticker && etf.Exchange == exchange && fileName != latestDownloadFilename {
			// delete the file
			err := os.Remove(downloadedEtfFolder + "/" + fileName)
			if err != nil {
				return deleted, err
			}
			deleted = true
		}
	}

	return deleted, nil
}
