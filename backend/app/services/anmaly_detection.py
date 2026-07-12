from sklearn.ensemble import IsolationForest

class AnomalyDetection:

    def train(self, dataframe):

        model = IsolationForest(
            contamination=0.05,
            random_state=42
        )

        model.fit(dataframe)

        return model

    def predict(self, model, dataframe):

        prediction = model.predict(dataframe)

        return prediction