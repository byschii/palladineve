package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `{
			"id": "hr9sjhtx0tunoyi",
			"created": "2023-02-01 21:52:48.783Z",
			"updated": "2023-02-01 21:52:48.783Z",
			"name": "xxx",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "guk10kff",
					"name": "field",
					"type": "text",
					"required": false,
					"unique": false,
					"options": {
						"min": null,
						"max": null,
						"pattern": ""
					}
				}
			],
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("hr9sjhtx0tunoyi")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
