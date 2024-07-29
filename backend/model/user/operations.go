package dbmodel

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"

	pycom "be/pythoncomunication"
)

func StoreNewUserImportantData(dao *daos.Dao, relatedUserId string) error {
	importantData := &UserImportantData{
		PaymentLevel:         "free",
		StripeSubscriptionId: "",
		RelatedUser:          relatedUserId,
		FreeOptimizations:    3,
		StripeCustomerId:     "",
	}
	err := dao.Save(importantData)
	return err
}

func StoreNewUserDetails(dao *daos.Dao, relatedUserId string) error {
	details := &UserDetails{
		Nickname:         "",
		RelatedUser:      relatedUserId,
		LastOptimization: make([]byte, 0),
	}
	err := dao.Save(details)
	return err
}

func SaveActivity(dao *daos.Dao, activity UserActivity) error {
	err := dao.Save(&activity)
	return err
}

func NewUserSubscription(dao *daos.Dao, relatedUserId string, subscriptionId string, customerId string) error {
	importantData := &UserImportantData{}
	err := dao.FindById(importantData, relatedUserId)
	if err != nil {
		return err
	}
	importantData.PaymentLevel = "premium"
	importantData.StripeSubscriptionId = subscriptionId
	importantData.StripeCustomerId = customerId
	err = dao.Save(importantData)
	return err
}

func ConsumeOptimization(dao *daos.Dao, relatedUserId string) error {
	importantData := &UserImportantData{}
	err := dao.DB().Select("*").From(importantData.TableName()).Where(dbx.In("related_user", relatedUserId)).One(importantData)
	if err != nil {
		return err
	}
	importantData.FreeOptimizations--
	err = dao.Save(importantData)
	return err
}

func SaveOptimizationResult(dao *daos.Dao, relatedUserId string, optimization []pycom.PythonResponseLayer) error {
	userDetails := &UserDetails{}
	err := dao.DB().Select("*").From(userDetails.TableName()).Where(dbx.In("related_user", relatedUserId)).One(userDetails)
	if err != nil {
		return err
	}

	// convert optimization to json string
	optimizationByte, err := json.Marshal(optimization)
	if err != nil {
		return err
	}
	userDetails.LastOptimization = optimizationByte
	err = dao.Save(userDetails)
	return err
}

func GetuUserImportantData(dao *daos.Dao, relatedUserId string) (*UserImportantData, error) {
	importantData := &UserImportantData{}
	err := dao.DB().Select("*").From(importantData.TableName()).Where(dbx.In("related_user", relatedUserId)).One(importantData)
	if err != nil {
		return nil, err
	}
	return importantData, nil
}
