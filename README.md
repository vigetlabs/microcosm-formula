# Formula

1. [Overview](#overview)
2. [Usage with Presenters](#usage-with-presenters)
3. [Performance](#performance)
4. [API](#api)

## Overview

The Formula abstraction provides a way
for
[Microcosm Presenters](http://code.viget.com/microcosm/api/presenter.html) to
efficiently prepare view models.

### Why

We created this abstraction in response to the following challenges:

1. Microcosm Presenters needed to calculate the same building blocks for numerous views. This often happens in the middle of an animation loop. We can not lose 100 milliseconds while charts animate into new positions.
2. Fetching data is hard to automate: each presenter needs to fetch new data as they receive new props. This logic is excrutiatingly complicated without finer grain control.
3. Expensive computation was constantly recalculated because it was difficult to isolate the changes that should trigger an update. Some charts need to aggregate data from 4-5 data sets, fetching a megabyte or more of JSON. We can't naively recalculate this data, it takes too many CPU cycles. IE11 just doesn't go.
4. We often don't _know_ what is expensive. Having the ability to break down a problem in to steps provides room for optimization and easier profiling.

### At a glance

The primary flow for a formula is three parts:

1. `track`: Determine the "variables" for a formula. This is an object of values or references to other Formulas.
2. `compute`: After resolving dependencies in `track`, this function returns a single computed value. This is the value passed into a Presenter or another Formula.
3. `update`: Triggers when a new answer is found. You can use this hook to push actions if data is missing.

```javascript
class Gizmoz extends Formula {
  track() {
    return { 
      gizmos: select('gizmos'), 
      query: new Query('weight')
    }
  }
  
  compute(assets, query) {
    return gizmos.filter(gizmo => gizmo.weight <= query.weight)
  }
  
  update (result, { gizmos, query }, repo) {
    if (gizmos.length <= 0) {
      repo.push(getGizmos)
    }
  }
}
```

## Usage with Presenters

Presenters can impliment a `getModel` function that tells them how to
build a view model for some application state. Formulas are valid
entries in the return value of this function.

```javascript
import Presenter from 'microcosm/addons/presenter'
// This is a formula
import CorrelationMatrix from '../correlation-matrix'

class Correlations extends Presenter {
  getModel(props) {
    return {
      data: new CorrelationMatrix(props.assets)
    }
  }

  render() {
    const { data } = this.model

    return <TableView data={data} />
  }
}
```

## Performance

Each Formula "answer" receives a unique hash code based upon the invocation parameters. This identity is used to recycle answers, sharing computation between Formulas of the same type, no matter where they are instantiated.

```javascript
let a = new Widgets('foobar')
let b = new Widgets('foobar')

console.log(a.calculate() === b.calculate()) // true
```

Every class that extends from Formula recieves a unique cache. Instances of classes that extend from Formula will not draw from the same pool of hashcodes. To illustrate:

```javascript
class Widgets extends Formula {}
class Gizmos extends Formula {}

console.log(new Widgets('a') === new Widgets('a')) // true
console.log(new Gizmos('a') === new Gizmos('a')) // true
console.log(new Gizmos('a') === new Widgets('a')) // false
```

### Pooling

The Formula library maintains an
[LRU Cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_Recently_Used_.28LRU.29). This allows Formula answers to be recycled between page navigation during the user's session.

### Profiling

Adding `?debug=true` to the URL will enable profiling mode for Formulas. In this mode, the cost of each Formula is recorded to the Performance timeline in Chrome. To produce a report:

1. Visit your URL with `?debug=true` in the URL search string
2. Open the Chrome Dev Tools
3. Navigate to the Performance tab
4. Record a session
5. Open the "User timings" accordion in the timeline view. You should
   see entries for specific Formulas.

## API

There are two public exports from `lib/formula`

1. **[Formula](#formula)**: The general abstraction for computing values
2. **[select](#select)**: Sugar for quickly extracting state from a
   Microcosm. 

### Formula 

#### constructor(...parameters)

Creates a new formula. Parameters sent into the Formula are passed to the `track()` method.

```javascript
class Widget extends Formula {
  track(id) {
    return { id }
  }
  // ...
}

new Widget(2) // id in track will be 2
```

#### track(...params)

Used to determine the parameters to pass into the `compute()` method. `params` come directly from instantiation arguments. 

The return value of this function should be an object of values or other formulas.

#### compute(...values)

A formula reduces the object returned from `track` into values. It then invokes `compute` with that list. The return value of this function is passed along to other Formulas or Presenters.

#### update(repo, computed, ...values)

Called when a formula computes a new answer. This is useful for behavior in response to new computed values.

- `repo` is the current Microcosm for the Presenter using this Formula. 
- `computed` is the result of the `compute()` function
- `...values` is the list passed into `compute()`

#### identity () 

Allows customization of the hash code to represent the unique identity of a Formula. Use with care!

## select

`select` provides a convinient way to extract a nested key from a state object without going through the ceremony of building an extension of Formula:

```javascript
import { select } from 'lib/formula'

class SolarSystem extends Presenter {
  getModel() {
    return {
      gravity: select('physics.gravity')
    }
  }
}
```

### select(keyPath)

Returns a new Formula for a given key path. This pulls values out of `repo.state` similarly to the [`get`](http://code.viget.com/microcosm/api/immutability-helpers.html#getobject-keypath-fallback) Microcosm helper.

Use `select()` to efficiently mix together multiple state values:

```javascript
import { select } from 'lib/formula'

class FocusedAsset extends Formula {
  track() {
    return { 
      asset: select('assets'), 
      focus: select('ui.focus') 
    }
  }
  
  compute({ assets, focus }) {
    return assets.find(asset => asset.id === focus)
  }
}

class AssetShowPage extends Presenter {
  getModel() {
    return {
      asset: new FocusedAsset()
    }
  }
  
  render () {
    const { asset } = this.model

    return <p>{ asset.name }</p>
  }
}
```
