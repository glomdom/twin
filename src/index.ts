import Object from "@rbxts/object-utils";
import { TweenService } from "@rbxts/services";

export class TweenBuilderBase<T extends Instance> {
  protected instance: T;
  protected tweenTime: number = 1;
  protected easingStyle: Enum.EasingStyle = Enum.EasingStyle.Linear;
  protected easingDirection: Enum.EasingDirection = Enum.EasingDirection.Out;
  protected properties: Partial<ExtractMembers<T, Tweenable>> = {};
  protected repeatCount: number = 0;
  protected reverses: boolean = false;
  protected delayTime: number = 0;

  protected onComplete?: () => void;

  constructor(instance: T) {
    this.instance = instance;
  }

  public time(seconds: number): this {
    this.tweenTime = seconds;

    return this;
  }

  public style(style: Enum.EasingStyle): this {
    this.easingStyle = style;

    return this;
  }

  public direction(direction: Enum.EasingDirection): this {
    this.easingDirection = direction;

    return this;
  }

  public repeat(count: number): this {
    this.repeatCount = count;

    return this;
  }

  public reverse(should = true): this {
    this.reverses = should;

    return this;
  }

  public delay(time: number): this {
    this.delayTime = time;

    return this;
  }

  public property<K extends ExtractKeys<T, Tweenable>>(prop: K, goal: T[K]): this {
    this.properties[prop] = goal;

    return this;
  }

  public propertiesBulk(props: Partial<ExtractMembers<T, Tweenable>>): this {
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        this.properties[key as never] = value as never;
      }
    });

    return this;
  }

  public onCompleted(callback: () => void): this {
    this.onComplete = callback;

    return this;
  }

  protected buildTween(): Tween {
    const info = new TweenInfo(
      this.tweenTime,
      this.easingStyle,
      this.easingDirection,
      this.repeatCount,
      this.reverses,
      this.delayTime,
    );

    return TweenService.Create(this.instance, info, this.properties);
  }

  public play(): Tween {
    const tween = this.buildTween();

    if (this.onComplete) {
      tween.Completed.Once(this.onComplete);
    }

    tween.Play();

    return tween;
  }
}

export class TweenValueBuilder<T extends ValueBase> extends TweenBuilderBase<T> {
  private onUpdate?: (value: T["Value"]) => void;

  constructor(instance: T) {
    super(instance);
  }

  public onUpdated(callback: (value: T["Value"]) => void): this {
    this.onUpdate = callback;

    return this;
  }

  public override play(): Tween {
    const tween = this.buildTween();

    if (this.onComplete) {
      tween.Completed.Once(this.onComplete);
    }

    if (this.onUpdate) {
      this.instance.Changed.Connect((newVal) => this.onUpdate!(newVal as T["Value"]));
    }

    tween.Play();

    return tween;
  }
}

export class TweenBuilder {
  public static for<T extends Instance>(instance: T): TweenBuilderBase<T> {
    return new TweenBuilderBase(instance);
  }

  public static forValue<T extends ValueBase>(instance: T): TweenValueBuilder<T> {
    return new TweenValueBuilder(instance);
  }

  public static forModel(model: Model) {
    const proxy = new Instance("CFrameValue");
    proxy.Value = model.GetPivot();

    return new TweenValueBuilder(proxy).onUpdated((val) => model.PivotTo(val));
  }
}
