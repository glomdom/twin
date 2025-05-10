# @rbxts/twin

A modern TweenService tween builder.

## Usage

```typescript
const part = Workspace.ExamplePart;

TweenBuilder.for(part)
  .property("CFrame", part.CFrame.add(new Vector3(1, 1, 1)).mul(CFrame.Angles(0, math.rad(45), 0)))
  .style(Enum.EasingStyle.Exponential)
  .direction(Enum.EasingDirection.InOUt)
  .repeat(3)
  .reverse()
  .play();
```
