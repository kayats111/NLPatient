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


for index, record in enumerate(records):
    print(f"---------------------{index}---------------------")

    for key, val in record.items():
        print(f"{key}: {val}")

    print("\nLabels:")
    print(f"any: {record["any"]}")
    print(f"affective: {record["affective"]}")
    print(f"bipolar: {record["bipolar"]}")
    print(f"schizophreniaSpectr: {record["schizophreniaSpectr"]}")

    print(f"---------------------{index}---------------------\n\n")

    print("press enter for the next record")
    input()
    print("\n")


