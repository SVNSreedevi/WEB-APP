import pandas as pd
df = pd.read_excel('dataset/AI_Blood_Loss_Estimation_Dataset_800_Rows_VideoBased.xlsx')
print(df.head())
print("Columns:", df.columns.tolist())
print("Data Types:", df.dtypes)
print("Missing Values:", df.isnull().sum())
