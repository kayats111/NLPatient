import requests
from Response import Response
import random



RECORDS_NUM = 500



data: list = [{
                "field1": random.uniform(0, 20),
                "field2": random.uniform(0, 20),
                "field3": random.uniform(0, 20),
                "field4": random.uniform(0, 20),
                "label": random.randint(0, 1)
                } for i in range(RECORDS_NUM)]



response: Response[dict]  # fetch
headers = {"Content-Type": "application/json"}
url = "http://localhost:3000/api/data/add"

for index, record in enumerate(data):
    apiResponse = requests.post(url=url, json=record, headers=headers)

    if apiResponse.status_code != 200:
        raise Exception(f"cannot send data at index {index}")

    jj = apiResponse.json()
    response = Response(value=jj["value"], error=jj["error"], message=jj["message"])

    if response.error:
        raise Exception(response.message)


print("done!")



















