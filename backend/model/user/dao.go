package dbmodel

import (
	"github.com/pocketbase/pocketbase/models"
)

/*
USER IMPORTANT DATA
this struct is used to store user's most important data
these data are not ment to be edited by the user
*/
type UserImportantData struct {
	models.BaseModel

	PaymentLevel         string `db:"payment_level" json:"payment_level"`
	StripeSubscriptionId string `db:"stripe_subscription_id" json:"stripe_subscription_id"`
	RelatedUser          string `db:"related_user" json:"related_user"`
	FreeOptimizations    int    `db:"free_optimizations" json:"free_optimizations"`
	StripeCustomerId     string `db:"stripe_customer_id" json:"stripe_customer_id"`
}

func (m *UserImportantData) TableName() string {
	return "user_important_data" // the name of your collection
}

var _ models.Model = (*UserImportantData)(nil)

/*
USER DETAILS
this struct is used to store user's details
these data are ment to be low importance and editable by the user
*/
type UserDetails struct {
	models.BaseModel

	Nickname         string `db:"nickname" json:"nickname"`
	RelatedUser      string `db:"related_user" json:"related_user"`
	LastOptimization []byte `db:"last_optimization" json:"last_optimization"`
}

func (m *UserDetails) TableName() string {
	return "user_details" // the name of your collection
}

var _ models.Model = (*UserDetails)(nil)

/*
ACTIVITY
this struct is used to store user's activity
expecially the one related to payments
*/

// activity to mapping
type AvailableActivity string

const (
	AvailableActivityOptimization AvailableActivity = "optimization"
	AvailableActivityUpdateEtf    AvailableActivity = "update_etf"
)

type UserActivity struct {
	models.BaseModel

	RelatedUser    string            `db:"related_user" json:"related_user"`
	ActivityType   AvailableActivity `db:"activity_type" json:"activity_type"`
	StripeRef      string            `db:"stripe_ref" json:"stripe_ref"`
	Note           string            `db:"note" json:"note"`
	ActivityInput  []byte            `db:"activity_input" json:"activity_input"`
	ActivityOutput []byte            `db:"activity_output" json:"activity_output"`
}

func (m *UserActivity) TableName() string {
	return "user_activity" // the name of your collection
}

var _ models.Model = (*UserActivity)(nil)
