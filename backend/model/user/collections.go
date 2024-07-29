package dbmodel

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/models/schema"
	"github.com/pocketbase/pocketbase/tools/types"
)

/*
In case of emergency
when db is destroyed (cause of a bug, new versione, new plan, etc)
you can use this function to recreate the collections
*/
func InitUserCollections(app *pocketbase.PocketBase) error {

	userCollectionId, err := app.Dao().FindCollectionByNameOrId("users")
	if err != nil {
		return err
	}

	// create a collection for storing user's important data
	userImportantData := &models.Collection{
		Name:       "user_important_data",
		Type:       models.CollectionTypeBase,
		ListRule:   types.Pointer("@request.auth.id = related_user.id"),
		ViewRule:   types.Pointer("@request.auth.id = related_user.id"),
		CreateRule: nil,
		UpdateRule: nil,
		DeleteRule: nil,
		Schema: schema.NewSchema(
			&schema.SchemaField{
				Name:     "payment_level",
				Type:     schema.FieldTypeSelect,
				Required: true,
				Unique:   false,
				Options: &schema.SelectOptions{
					Values: []string{"free", "premium"},
				},
			},
			&schema.SchemaField{
				Name:     "last_stripe_payment",
				Type:     schema.FieldTypeText,
				Required: false,
				Unique:   true,
			},
			&schema.SchemaField{
				Name:     "related_user",
				Type:     schema.FieldTypeRelation,
				Required: true,
				Unique:   true,
				Options: &schema.RelationOptions{
					MaxSelect:     types.Pointer(1),
					CollectionId:  userCollectionId.Id,
					CascadeDelete: true,
				},
			},
			&schema.SchemaField{
				Name:     "free_optimizations",
				Type:     schema.FieldTypeNumber,
				Required: true,
				Unique:   false,
			},

		),
	}

	// create a collection for storing user's details
	userDetails := &models.Collection{
		Name:       "user_details",
		Type:       models.CollectionTypeBase,
		ListRule:   types.Pointer("@request.auth.id = related_user.id"),
		ViewRule:   types.Pointer("@request.auth.id = related_user.id"),
		CreateRule: nil,
		UpdateRule: types.Pointer("@request.auth.id = related_user.id"),
		DeleteRule: nil,
		Schema: schema.NewSchema(
			&schema.SchemaField{
				Name:     "nickname",
				Type:     schema.FieldTypeText,
				Required: false,
				Unique:   false,
			},
			&schema.SchemaField{
				Name:     "bio",
				Type:     schema.FieldTypeText,
				Required: false,
				Unique:   false,
			},
			&schema.SchemaField{
				Name:     "related_user",
				Type:     schema.FieldTypeRelation,
				Required: true,
				Unique:   true,
				Options: &schema.RelationOptions{
					MaxSelect:     types.Pointer(1),
					CollectionId:  userCollectionId.Id,
					CascadeDelete: true,
				},
			},
			&schema.SchemaField{
				Name:     "last_optimization",
				Type:     schema.FieldTypeJson,
				Required: false,
				Unique:   false,
			},

		),
	}

	// check if the collections already exist
	if _, err := app.Dao().FindCollectionByNameOrId(userImportantData.Name); err != nil {
		if err := app.Dao().SaveCollection(userImportantData); err != nil {
			return err
		}
	} else {
		log.Default().Printf("Collection %s already exists", userImportantData.Name)
	}

	if _, err := app.Dao().FindCollectionByNameOrId(userDetails.Name); err != nil {
		if err := app.Dao().SaveCollection(userDetails); err != nil {
			return err
		}
	} else {
		log.Default().Printf("Collection %s already exists", userDetails.Name)
	}

	return nil
}
