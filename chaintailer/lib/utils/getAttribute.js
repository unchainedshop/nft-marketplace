/*
"Attributes" : [
    {
        "Attribute" : {
            "Code" : "ALLG_OBJEKT_TYP",
            "Value" : {
                "DES" : "Standard-Reparatur#*R"
            }
        }
    },
    {
        "Attribute" : {
            "Code" : "ALLG_VELOCARD",
            "Value" : {
                "DES" : "1= Velocard Faktor 1#1"
            }
        }
    }
],
*/
export default (rawAttributes, key, { locale = "DES" } = {}) => {
  const foundAttributeValuesForKey = rawAttributes
    .filter((rawAttribute) => rawAttribute.Attribute.Code === key)
    .map((rawAttribute) => rawAttribute.Attribute.Value[locale])
    .filter(Boolean);

  if (!foundAttributeValuesForKey?.length) return {};

  return Object.fromEntries(
    foundAttributeValuesForKey.map((keyValueString) => {
      const [value, optionKey] = keyValueString.split("#");
      const normalizedKey = (optionKey || value || "").trim();
      const normalizedValue = (value || optionKey || "").trim();
      return [normalizedKey, normalizedValue];
    })
  );
};
