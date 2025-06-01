import sqlite3
import requests
from Response import Response


fields = ['codingNum', 'yearOfEvent', 'age',
          'gender', 'sector', 'origin', 'originGroup',
          'immigrationYear', 'LMSSocialStateScore',
          'clalitMember', 'parentState', 'parentStateGroup',
          'livingWith', 'livingWithGroup', 'siblingsTotal',
          'numInSiblings', 'familyHistoryMH', 'school',
          'schoolGroup', 'prodrom', 'prodGroup', 'posLengthGroup',
          'psLengthG2', 'vocalHallucinations', 'visualHallucinations',
          'dellusions', 'disorgenizeBahaviour', 'thoughtProcess',
          'speechSym', 'negSigns', 'sleepDisorder', 'catatonia',
          'maniformSym', 'depressizeSym', 'drugUseCurrent',
          'drugUseHistory', 'traditionalTreat', 'violence',
          'irritabilityAnamneza', 'suicidal', 'backdiagnos',
          'organicworkup', 'conhospi', 'noconhospi', 'futurediag',
          'any', 'affective', 'bipolar', 'schizophreniaSpectr',
          'psychotic2nd']


records = []


# read records from db
try:
    with sqlite3.connect('PsychosisProject.db') as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM PsychosisTable')

        rows = cur.fetchall()

        records = [{field: value for field, value in zip(fields, row)} for row in rows]

except sqlite3.OperationalError as e:
    print(e)


for record in records:
    record.pop("backdiagnos")
    record.pop("noconhospi")
    record.pop("futurediag")
    record.pop("psychotic2nd")

# print records in a form and save text
for index, record in enumerate(records):
    print(f"---------------------{index}---------------------")

    for key, val in record.items():
        print(f"{key}: {val}")

    print(f"---------------------{index}---------------------\n\n")

    print("Insert the generated text:")
    text:str = input()
    print("\n")

    # print(text)
    # print("\n")

    # input()

    # send to DataManager
    response: Response[dict]  # fetch
    headers = {"Content-Type": "application/json"}
    url = "http://localhost:3000/api/data/text/add"

    textRecord = {
        "text": text,
        "any": record['any'],
        "affective": record['affective'],
        "bipolar": record['bipolar'],
        "schizophreniaSpectr": record['schizophreniaSpectr']
    }

    apiResponse = requests.post(url=url, json=textRecord, headers=headers)

    if apiResponse.status_code != 200:
        raise Exception(f"cannot send data at index {index}")
    
    jj = apiResponse.json()
    response = Response(value=jj["value"], error=jj["error"], message=jj["message"])

    if response.error:
        raise Exception(response.message)
    
    print(f"{index + 1} / {len(records)}")


