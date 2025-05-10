import Object from "@rbxts/object-utils";
import { TweenService } from "@rbxts/services";

export default class TweenBuilder<T extends Instance> {
  private readonly _instanceRef: T;

  private _tweenTime: number = 1;
  private _easingStyle: Enum.EasingStyle = Enum.EasingStyle.Linear;
  private _easingDirection: Enum.EasingDirection = Enum.EasingDirection.Out;
  private _properties: Partial<ExtractMembers<T, Tweenable>> = {};
  private _repeatCount: number = 0;
  private _reverses: boolean = false;
  private _delayTime: number = 0;

  private _onCompleteCallback?: () => void;

  private constructor(instance: T) {
    this._instanceRef = instance;
  }

  public static for<T extends Instance>(instance: T): TweenBuilder<T> {
    return new TweenBuilder(instance);
  }

  public time(seconds: number): this {
    this._tweenTime = seconds;

    return this;
  }

  public style(style: Enum.EasingStyle): this {
    this._easingStyle = style;

    return this;
  }

  public direction(direction: Enum.EasingDirection): this {
    this._easingDirection = direction;

    return this;
  }

  public repeat(count: number): this {
    this._repeatCount = count;

    return this;
  }

  public reverse(should: boolean = true): this {
    this._reverses = should;

    return this;
  }

  public delay(time: number): this {
    this._delayTime = time;

    return this;
  }

  public property<K extends ExtractKeys<T, Tweenable>>(prop: K, goal: T[K]): this {
    this._properties[prop] = goal;

    return this;
  }

  public propertiesBulk(props: Partial<ExtractMembers<T, Tweenable>>): this {
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        this._properties[key as never] = value as never;
      }
    });

    return this;
  }

  public onCompleted(callback: () => void): this {
    this._onCompleteCallback = callback;

    return this;
  }

  public clone(): TweenBuilder<T> {
    const copy = new TweenBuilder(this._instanceRef);
    copy._tweenTime = this._tweenTime;
    copy._easingStyle = this._easingStyle;
    copy._easingDirection = this._easingDirection;
    copy._repeatCount = this._repeatCount;
    copy._reverses = this._reverses;
    copy._delayTime = this._delayTime;
    copy._onCompleteCallback = this._onCompleteCallback;
    copy._properties = Object.assign({}, this._properties);

    return copy;
  }

  public build(): Tween {
    assert(this._instanceRef !== undefined, "TweenBuilder: No instance provided.");

    if (next(this._properties) === undefined) {
      warn("TweenBuilder: No properties set for tweening.");
    }

    const tweenInfo = new TweenInfo(
      this._tweenTime,
      this._easingStyle,
      this._easingDirection,
      this._repeatCount,
      this._reverses,
      this._delayTime,
    );

    return TweenService.Create(this._instanceRef, tweenInfo, this._properties);
  }

  /**
   * Convenience method for building and playing a tween, also runs the provided `onComplete` callback.
   * @returns The built tween.
   */
  public play(): Tween {
    const tween = this.build();

    if (this._onCompleteCallback) {
      tween.Completed.Once(this._onCompleteCallback);
    }

    tween.Play();

    return tween;
  }
}
