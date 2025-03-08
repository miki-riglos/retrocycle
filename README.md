# retrocycle
Restore references after parsing JSON

## Example (.NET server)
### Server
#### Serialization using NewtonsoftJson
```csharp
builder.Services.AddControllers()
                .AddNewtonsoftJson(options => {
                    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
                    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Serialize;
                    options.SerializerSettings.PreserveReferencesHandling = PreserveReferencesHandling.All;
                });

```
#### Controller
```csharp
public class Complex
{
	public string Name { get; set; } = string.Empty;
	public List<Complex> Children { get; set; } = [];
}

[ApiController]
public class SomeController : ControllerBase
{
	[Route("api/some/complexObject")]
	[HttpGet]
	public IActionResult GetComplexObject() {
		Complex complextObject = new();
		complextObject.Name = "Root";
		complextObject.Children.Add(complextObject);
		complextObject.Children.Add(new() { Name = "Child" });
		return Ok(complextObject);
	}
}
```

### Client
```ts
fetch('api/some/complexObject')
	.then(resp => resp.json())
	.then(refComplexObj => {
		console.log(refComplexObj);
		/*
			{
				"$id": "1",
				"Name": "Root",
				"Children": {
					"$id": "2",
					"$values": [{
							"$ref": "1"
						}, {
							"$id": "3",
							"Name": "Child",
							"Children": {
								"$id": "4",
								"$values": []
							}
						}
					]
				}
			}
		*/
		let complexObj = retrocycle(refComplexObj);
		console.log(complexObj);
		/*
			{
				"Name": "Root",
				"Children": [{
						"Name": "Root",
						"Children": [{
								...
							}, {
								"Name": "Child",
								"Children": []
							}
						]
					}, {
						"Name": "Child",
						"Children": []
					}
				]
			}
		*/
		return complexObj;
	})
```