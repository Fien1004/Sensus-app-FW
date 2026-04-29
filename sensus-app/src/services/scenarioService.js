import scenario1 from "../scenarios/scenario-1.json"

export const scenarios = [scenario1]

export function getScenarioById(id) {
  return scenarios.find((scenario) => scenario.id === id)
}