import scenario1 from '../scenarios/scenario-1.json'

export function getScenarioById(id) {
  const scenarios = [scenario1]
  return scenarios.find((scenario) => scenario.id === id)
}